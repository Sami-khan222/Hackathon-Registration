const router = require('express').Router();
const { getStats, listRegistrations, listCancellations, exportRegistrations } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

// Har admin route par login AND ADMIN_EMAILS dono chahiye
router.use(protect, adminOnly);

router.get('/stats', getStats);
router.get('/registrations/export', exportRegistrations);
router.get('/registrations', listRegistrations);
router.get('/cancellations', listCancellations);

module.exports = router;