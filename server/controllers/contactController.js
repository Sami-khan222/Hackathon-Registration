const ContactMessage = require('../models/ContactMessage');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const { validateContact } = require('../utils/validators');
const { sendContactEmail } = require('../services/emailService');

// POST /api/contact
const submitContact = asyncHandler(async (req, res) => {
  const data = validateContact(req.body);
  await ContactMessage.create(data); // stored first so nothing is lost if SMTP is down

  try {
    await sendContactEmail(data);
  } catch (error) {
    console.error('Contact email failed:', error.message);
  }
  sendSuccess(res, 201, 'Thanks for reaching out. We will reply to your email soon.');
});

module.exports = { submitContact };
