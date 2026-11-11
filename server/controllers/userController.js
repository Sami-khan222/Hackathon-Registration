const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const { validateProfileUpdate } = require('../utils/validators');
const HackathonRegistration = require('../models/HackathonRegistration');
const { isAdminEmail } = require('../middleware/auth');

// GET /api/user/me
const getMe = asyncHandler(async (req, res) => {
  const registration = await HackathonRegistration.exists({ userId: req.user._id });
  sendSuccess(res, 200, 'Profile fetched.', {
    user: req.user.toJSON(),
    isRegistered: Boolean(registration),
    isAdmin: isAdminEmail(req.user.email),
  });
});

// PUT /api/user/update (name only: email is the account identity and is verified by OTP)
const updateMe = asyncHandler(async (req, res) => {
  const { fullName } = validateProfileUpdate(req.body);
  req.user.fullName = fullName;
  await req.user.save();
  sendSuccess(res, 200, 'Profile updated.', { user: req.user.toJSON() });
});

module.exports = { getMe, updateMe };