const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { OTP_LENGTH, OTP_EXPIRY_MINUTES } = require('../config/constants');

/** Cryptographically secure 6-digit OTP (crypto.randomInt is uniform, unlike Math.random). */
const generateOtp = () => String(crypto.randomInt(0, 10 ** OTP_LENGTH)).padStart(OTP_LENGTH, '0');

/** Creates a fresh OTP together with the hash and expiry that get stored. The plain OTP is only emailed. */
const issueOtp = async () => {
  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, 10);
  const otpExpiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
  return { otp, otpHash, otpExpiry };
};

const verifyOtpHash = (otp, otpHash) => bcrypt.compare(otp, otpHash);

module.exports = { generateOtp, issueOtp, verifyOtpHash };
