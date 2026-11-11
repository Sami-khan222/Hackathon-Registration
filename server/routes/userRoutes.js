const router = require('express').Router();
const { getMe, updateMe } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/me', protect, getMe);
router.put('/update', protect, updateMe);

module.exports = router;
