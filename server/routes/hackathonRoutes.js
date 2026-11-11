const router = require('express').Router();
const { getOptions, registerForHackathon, getMyEntry, deleteEntry } = require('../controllers/hackathonController');
const { protect } = require('../middleware/auth');

router.get('/options', getOptions);
router.post('/register', protect, registerForHackathon);
router.get('/my-entry', protect, getMyEntry);
router.delete('/:id', protect, deleteEntry);

module.exports = router;
