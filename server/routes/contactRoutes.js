const router = require('express').Router();
const { submitContact } = require('../controllers/contactController');
const { contactLimiter } = require('../middleware/rateLimiters');


const { protect } = require('../middleware/auth');
router.post('/', protect, contactLimiter, submitContact);
module.exports = router;
