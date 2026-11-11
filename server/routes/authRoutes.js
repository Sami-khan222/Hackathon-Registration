const router = require('express').Router();
const { signup, verifyOtp, resendOtp, login, logout } = require('../controllers/authController');
const { authLimiter, otpLimiter } = require('../middleware/rateLimiters');

router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);
router.post('/verify-otp', otpLimiter, verifyOtp);
router.post('/resend-otp', otpLimiter, resendOtp);
router.post('/logout', logout);

module.exports = router;
