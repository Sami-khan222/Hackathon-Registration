const bcrypt = require('bcryptjs');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const { issueOtp, verifyOtpHash } = require('../utils/otp');
const { signToken, setAuthCookie, clearAuthCookie } = require('../utils/token');
const { validateSignup, validateLogin, validateOtpPayload, validateEmailOnly } = require('../utils/validators');
const { sendOtpEmail } = require('../services/emailService');
const { OTP_RESEND_COOLDOWN_SECONDS, OTP_MAX_ATTEMPTS } = require('../config/constants');

// Used to keep login timing similar whether or not the email exists
const DUMMY_HASH = bcrypt.hashSync('timing-safe-placeholder', 12);

const secondsUntil = (date) => Math.max(0, Math.ceil((date.getTime() - Date.now()) / 1000));

/**
 * Generates a new OTP on the user document, saves it, and emails it.
 * If the email fails, the cooldown is lifted so the person can retry immediately.
 */
const issueAndSendOtp = async (user) => {
  const { otp, otpHash, otpExpiry } = await issueOtp();
  user.otpHash = otpHash;               // previous OTP is invalidated by being overwritten
  user.otpExpiry = otpExpiry;
  user.otpAttempts = 0;
  user.otpResendAvailableAt = new Date(Date.now() + OTP_RESEND_COOLDOWN_SECONDS * 1000);
  await user.save();

  try {
    await sendOtpEmail({ to: user.email, fullName: user.fullName, otp });
  } catch (error) {
    console.error('OTP email failed:', error.message);
    user.otpResendAvailableAt = new Date();
    await user.save();
    throw new ApiError(502, 'We could not send the verification email. Please try Resend OTP in a moment.', null, { resendAvailableInSeconds: 0 });
  }
};

// POST /api/auth/signup
const signup = asyncHandler(async (req, res) => {
  const { fullName, email, password } = validateSignup(req.body);

  let user = await User.findOne({ email }).select('+otpResendAvailableAt');
  if (user?.isVerified) throw new ApiError(409, 'An account with this email already exists. Please log in.');

  const passwordHash = await bcrypt.hash(password, 12);

  if (user) {
    // Unverified leftover from an earlier attempt: let them restart, but respect the resend cooldown
    if (user.otpResendAvailableAt && user.otpResendAvailableAt > new Date()) {
      throw new ApiError(429, 'A verification code was just sent. Please wait before trying again.', null, {
        resendAvailableInSeconds: secondsUntil(user.otpResendAvailableAt),
      });
    }
    user.fullName = fullName;
    user.password = passwordHash;
  } else {
    user = new User({ fullName, email, password: passwordHash });
  }

  try {
    await issueAndSendOtp(user);
  } catch (error) {
    if (error.code === 11000) throw new ApiError(409, 'An account with this email already exists. Please log in.');
    throw error;
  }

  sendSuccess(res, 201, 'Account created. We sent a 6-digit code to your email.', {
    email: user.email,
    resendAvailableInSeconds: OTP_RESEND_COOLDOWN_SECONDS,
  });
});

// POST /api/auth/verify-otp
const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = validateOtpPayload(req.body);
  const genericFailure = new ApiError(400, 'Invalid or expired code. Request a new one and try again.');

  const user = await User.findOne({ email }).select('+otpHash +otpExpiry +otpAttempts');
  if (!user || user.isVerified || !user.otpHash || !user.otpExpiry) throw genericFailure;

  if (user.otpAttempts >= OTP_MAX_ATTEMPTS) {
    throw new ApiError(429, 'Too many incorrect attempts. Please request a new code.');
  }
  if (user.otpExpiry < new Date()) {
    throw new ApiError(400, 'This code has expired. Please request a new one.', null, { code: 'OTP_EXPIRED' });
  }

  const matches = await verifyOtpHash(otp, user.otpHash);
  if (!matches) {
    user.otpAttempts += 1;
    await user.save();
    const remaining = Math.max(0, OTP_MAX_ATTEMPTS - user.otpAttempts);
    throw new ApiError(400, remaining ? `Incorrect code. ${remaining} attempt${remaining === 1 ? '' : 's'} left.` : 'Too many incorrect attempts. Please request a new code.');
  }

  // Atomic update that only succeeds if this exact OTP is still stored: a code can never be used twice
  const result = await User.updateOne(
    { _id: user._id, otpHash: user.otpHash },
    { $set: { isVerified: true }, $unset: { otpHash: 1, otpExpiry: 1, otpResendAvailableAt: 1 } }
  );
  if (result.modifiedCount !== 1) throw genericFailure;

  sendSuccess(res, 200, 'Email verified. You can now log in.');
});

// POST /api/auth/resend-otp
const resendOtp = asyncHandler(async (req, res) => {
  const { email } = validateEmailOnly(req.body);
  const user = await User.findOne({ email }).select('+otpResendAvailableAt');

  // Same answer for unknown or already-verified emails so the endpoint can't be used to probe accounts
  if (!user || user.isVerified) {
    return sendSuccess(res, 200, 'If this email is awaiting verification, a new code is on its way.', {
      resendAvailableInSeconds: OTP_RESEND_COOLDOWN_SECONDS,
    });
  }

  if (user.otpResendAvailableAt && user.otpResendAvailableAt > new Date()) {
    const wait = secondsUntil(user.otpResendAvailableAt);
    throw new ApiError(429, `Please wait ${wait}s before requesting another code.`, null, { resendAvailableInSeconds: wait });
  }

  await issueAndSendOtp(user);
  sendSuccess(res, 200, 'A new code has been sent to your email.', { resendAvailableInSeconds: OTP_RESEND_COOLDOWN_SECONDS });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = validateLogin(req.body);
  const user = await User.findOne({ email }).select('+password');

  const passwordMatches = await bcrypt.compare(password, user ? user.password : DUMMY_HASH);
  if (!user || !passwordMatches) throw new ApiError(401, 'Invalid email or password.');

  if (!user.isVerified) {
    throw new ApiError(403, 'Please verify your email before logging in.', null, { code: 'UNVERIFIED', email: user.email });
  }

  setAuthCookie(res, signToken(user._id));
  sendSuccess(res, 200, 'Welcome back!', { user: user.toJSON() });
});

// POST /api/auth/logout
const logout = asyncHandler(async (_req, res) => {
  clearAuthCookie(res);
  sendSuccess(res, 200, 'You have been logged out.');
});

module.exports = { signup, verifyOtp, resendOtp, login, logout };
