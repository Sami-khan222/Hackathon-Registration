const rateLimit = require('express-rate-limit');

const build = (windowMinutes, max, message) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => res.status(429).json({ success: false, message }),
  });

module.exports = {
  apiLimiter: build(15, 300, 'Too many requests. Please try again in a few minutes.'),
  authLimiter: build(15, 20, 'Too many attempts. Please try again in 15 minutes.'),
  otpLimiter: build(15, 10, 'Too many OTP requests. Please try again in 15 minutes.'),
  contactLimiter: build(60, 5, 'You have sent several messages recently. Please try again later.'),
};
