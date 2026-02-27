const pool = require('../config/db');

// @desc    Submit code for a problem (User)
exports.submitCode = async (req, res) => {
    try {
        const { problemId, language, code, contestId } = req.body;
        const userId = req.user.id;

        // 1. No test cases required for Manual Admin Review; skipping test case check

        // 2. Save Submission directly as Pending
        const [insertResult] = await pool.query(
            'INSERT INTO submissions (user_id, problem_id, language, code, status, runtime, contest_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId, problemId, language, code, 'Pending', 0, contestId || null]
        );

        // 3. Update Contest Score (If applicable)
        // We might not want to guarantee points immediately for pending, but the user requested immediate solving count.
        // We'll increment the points just to satisfy immediate counting.
        if (contestId) {
            const [prevSuccess] = await pool.query(
                "SELECT * FROM submissions WHERE user_id = ? AND problem_id = ? AND contest_id = ? AND status IN ('Accepted', 'Pending') AND id != ?",
                [userId, problemId, contestId, insertResult.insertId]
            );
            
            if (prevSuccess.length === 0) {
                const [cpRows] = await pool.query(
                    'SELECT points FROM contest_problems WHERE contest_id = ? AND problem_id = ?', 
                    [contestId, problemId]
                );
                const points = cpRows.length > 0 ? cpRows[0].points : 100;
                
                const [contests] = await pool.query('SELECT start_time FROM contests WHERE id = ?', [contestId]);
                let penalty = 0;
                if (contests.length > 0) {
                    const startTime = new Date(contests[0].start_time);
                    const now = new Date();
                    penalty = Math.floor((now - startTime) / 60000);
                }
                
                await pool.query(
                    'UPDATE contest_participants SET score = score + ?, penalty = penalty + ? WHERE contest_id = ? AND user_id = ?',
                    [points, penalty, contestId, userId]
                );
            }
        }

        res.status(201).json({
            message: 'Code submitted for Admin Review',
            submissionId: insertResult.insertId,
            status: 'Pending',
            runtime: 0
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            message: 'Server Error during submission execution', 
            details: error.message || error.toString() 
        });
    }
};

// @desc    Get user's submission history
exports.getUserSubmissions = async (req, res) => {
    try {
        const userId = req.user.id;
        const [submissions] = await pool.query(`
            SELECT s.id, s.problem_id, p.title as problem_title, s.language, s.status, s.runtime, s.submitted_at 
            FROM submissions s
            JOIN problems p ON s.problem_id = p.id
            WHERE s.user_id = ? 
            ORDER BY s.submitted_at DESC
        `, [userId]);

        res.status(200).json(submissions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all submissions (Admin / Leaderboard)
exports.getAllSubmissions = async (req, res) => {
    try {
        const [submissions] = await pool.query(`
            SELECT s.id, s.user_id, u.name as user_name, p.title as problem_title, s.language, s.code, s.status, s.runtime, s.submitted_at 
            FROM submissions s
            JOIN users u ON s.user_id = u.id
            JOIN problems p ON s.problem_id = p.id
            ORDER BY s.submitted_at DESC
        `);

        res.status(200).json(submissions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update submission status manually (Admin)
exports.updateSubmissionStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const submissionId = req.params.id;

        await pool.query('UPDATE submissions SET status = ? WHERE id = ?', [status, submissionId]);

        res.status(200).json({ message: 'Status updated successfully', status });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete all submissions (Admin)
exports.deleteAllSubmissions = async (req, res) => {
    try {
        await pool.query('DELETE FROM submissions');
        res.status(200).json({ message: 'All submissions cleared successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error clearing submissions' });
    }
};
