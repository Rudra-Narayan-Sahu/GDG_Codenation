const express = require('express');
const router = express.Router();
const { 
    getContests, 
    getContestById, 
    createContest, 
    updateContest,
    deleteContest,
    joinContest, 
    getLeaderboard,
    sendContestReminder
} = require('../controllers/contestController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, getContests);
router.get('/:id', protect, getContestById);
router.post('/', protect, adminOnly, createContest);
router.put('/:id', protect, adminOnly, updateContest);
router.delete('/:id', protect, adminOnly, deleteContest);
router.post('/:id/join', protect, joinContest);
router.post('/:id/remind', protect, adminOnly, sendContestReminder);
router.get('/:id/leaderboard', protect, getLeaderboard);

module.exports = router;
