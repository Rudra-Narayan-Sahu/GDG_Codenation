const express = require('express');
const router = express.Router();
const { 
    getContests, 
    getContestById, 
    createContest, 
    joinContest, 
    getLeaderboard 
} = require('../controllers/contestController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, getContests);
router.get('/:id', protect, getContestById);
router.post('/', protect, adminOnly, createContest);
router.post('/:id/join', protect, joinContest);
router.get('/:id/leaderboard', protect, getLeaderboard);

module.exports = router;
