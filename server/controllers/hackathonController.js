const mongoose = require('mongoose');
const HackathonRegistration = require('../models/HackathonRegistration');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const { validateRegistration } = require('../utils/validators');
const { sendRegistrationConfirmationEmail } = require('../services/emailService');
const C = require('../config/constants');
const RegistrationCancellation = require('../models/RegistrationCancellation');

// GET /api/hackathon/options (public: powers the dropdowns so lists live in one place)
const getOptions = (_req, res) =>
  sendSuccess(res, 200, 'Options fetched.', {
    colleges: C.COLLEGES, courses: C.COURSES, branches: C.BRANCHES,
    yearsOfStudy: C.YEARS_OF_STUDY, domains: C.DOMAINS, teamSizes: C.TEAM_SIZES,
  });

// POST /api/hackathon/register
const registerForHackathon = asyncHandler(async (req, res) => {
  const data = validateRegistration(req.body);

  if (await HackathonRegistration.exists({ userId: req.user._id })) {
    throw new ApiError(409, 'You have already registered for this hackathon.');
  }

  let registration;
  try {
    registration = await HackathonRegistration.create({ ...data, userId: req.user._id });
  } catch (error) {
    // Unique index catches two simultaneous submissions that both passed the check above
    if (error.code === 11000) throw new ApiError(409, 'You have already registered for this hackathon.');
    throw error;
  }

  // The registration is saved even if the email fails; the client is told so it can show a notice
  let emailSent = true;
  try {
    await sendRegistrationConfirmationEmail({ to: req.user.email, registration });
  } catch (error) {
    emailSent = false;
    console.error('Confirmation email failed:', error.message);
  }

  sendSuccess(res, 201, emailSent ? 'Registration successful. A confirmation email is on its way.' : 'Registration successful, but we could not send the confirmation email.', {
    registration,
    emailSent,
  });
});

// GET /api/hackathon/my-entry
const getMyEntry = asyncHandler(async (req, res) => {
  const registration = await HackathonRegistration.findOne({ userId: req.user._id });
  sendSuccess(res, 200, registration ? 'Registration fetched.' : 'No registration found.', { registration });
});

// DELETE /api/hackathon/:id (sirf owner). Registration delete hoti hai,
// lekin ek copy RegistrationCancellation mein rehti hai taaki admin count dekh sake.
const deleteEntry = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, 'Invalid registration id.');
  const registration = await HackathonRegistration.findOne({ _id: req.params.id, userId: req.user._id });
  if (!registration) throw new ApiError(404, 'Registration not found.');

  await RegistrationCancellation.create({
    userId: registration.userId,
    fullName: registration.fullName,
    email: registration.email,
    projectName: registration.projectName,
    domain: registration.domain,
    registeredAt: registration.createdAt,
    snapshot: registration.toObject(),
  });
  await registration.deleteOne();
  sendSuccess(res, 200, 'Registration cancelled. You can register again.');
});

module.exports = { getOptions, registerForHackathon, getMyEntry, deleteEntry };
