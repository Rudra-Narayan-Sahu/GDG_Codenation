const pool = require('../config/db');

// @desc    Get all contests
// @route   GET /api/contests
// @access  Public or User
exports.getContests = async (req, res) => {
    try {
        const [contests] = await pool.query('SELECT * FROM contests ORDER BY start_time DESC');
        res.status(200).json(contests);
    } catch (error) {
        console.error("Error fetching contests:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get single contest details
// @route   GET /api/contests/:id
// @access  Public or User
exports.getContestById = async (req, res) => {
    try {
        const [contests] = await pool.query('SELECT * FROM contests WHERE id = ?', [req.params.id]);
        
        if (contests.length === 0) {
            return res.status(404).json({ message: 'Contest not found' });
        }
        
        const contest = contests[0];
        
        // Also fetch problems if the contest has started or if the user is an admin
        let problems = [];
        const now = new Date();
        const startTime = new Date(contest.start_time);
        
        if (now >= startTime || (req.user && req.user.role === 'Admin')) {
            const [problemRows] = await pool.query(`
                SELECT p.id, p.title, p.difficulty, cp.points
                FROM problems p
                JOIN contest_problems cp ON p.id = cp.problem_id
                WHERE cp.contest_id = ?
            `, [contest.id]);
            problems = problemRows;
        }

        res.status(200).json({ ...contest, problems });
    } catch (error) {
        console.error("Error fetching contest:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a new contest
// @route   POST /api/contests
// @access  Admin
exports.createContest = async (req, res) => {
    try {
        const { title, description, start_time, end_time, problems } = req.body;
        
        const [result] = await pool.query(
            'INSERT INTO contests (title, description, start_time, end_time, created_by) VALUES (?, ?, ?, ?, ?)',
            [title, description, start_time, end_time, req.user.id]
        );
        
        const contestId = result.insertId;
        
        // Add problems if provided
        if (problems && problems.length > 0) {
            for (const prob of problems) {
                await pool.query(
                    'INSERT INTO contest_problems (contest_id, problem_id, points) VALUES (?, ?, ?)',
                    [contestId, prob.id, prob.points || 100]
                );
            }
        }
        
        res.status(201).json({ message: 'Contest created successfully', contestId });
    } catch (error) {
        console.error("Error creating contest:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Join a contest
// @route   POST /api/contests/:id/join
// @access  Private
exports.joinContest = async (req, res) => {
    try {
        const contestId = req.params.id;
        const userId = req.user.id;
        
        const [contests] = await pool.query('SELECT * FROM contests WHERE id = ?', [contestId]);
        if (contests.length === 0) {
            return res.status(404).json({ message: 'Contest not found' });
        }
        
        // Check if already joined
        const [participants] = await pool.query('SELECT * FROM contest_participants WHERE contest_id = ? AND user_id = ?', [contestId, userId]);
        if (participants.length > 0) {
            return res.status(400).json({ message: 'Already joined this contest' });
        }
        
        await pool.query('INSERT INTO contest_participants (contest_id, user_id) VALUES (?, ?)', [contestId, userId]);
        
        res.status(200).json({ message: 'Successfully joined the contest' });
    } catch (error) {
        console.error("Error joining contest:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get contest leaderboard
// @route   GET /api/contests/:id/leaderboard
// @access  Public or User
exports.getLeaderboard = async (req, res) => {
    try {
        const contestId = req.params.id;
        const [leaderboard] = await pool.query(`
            SELECT cp.user_id, u.name, cp.score, cp.penalty
            FROM contest_participants cp
            JOIN users u ON cp.user_id = u.id
            WHERE cp.contest_id = ?
            ORDER BY cp.score DESC, cp.penalty ASC
        `, [contestId]);
        
        res.status(200).json(leaderboard);
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};
