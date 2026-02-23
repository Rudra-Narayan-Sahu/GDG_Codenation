const pool = require('./db.js'); 
async function seed() { 
    try { 
        const [p] = await pool.query(
            'INSERT INTO problems (title,description,difficulty,is_daily) VALUES (?,?,?,?)', 
            [
                'Two Sum', 
                'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.\n\n**Example 1:**\n```\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].\n```', 
                'Easy', 
                true
            ]
        ); 
        const pid = p.insertId; 
        await pool.query('INSERT INTO test_cases (problem_id, input, expected_output, is_hidden) VALUES (?, ?, ?, ?)', [pid, '2 7 11 15\n9\n', '0 1\n', false]); 
        await pool.query('INSERT INTO test_cases (problem_id, input, expected_output, is_hidden) VALUES (?, ?, ?, ?)', [pid, '3 2 4\n6\n', '1 2\n', true]); 
        await pool.query('INSERT INTO test_cases (problem_id, input, expected_output, is_hidden) VALUES (?, ?, ?, ?)', [pid, '3 3\n6\n', '0 1\n', true]); 
        
        // Ensure no other problem is daily
        await pool.query('UPDATE problems SET is_daily = FALSE WHERE id != ?', [pid]);
        
        console.log('Problem seeded', pid); 
        process.exit(0); 
    } catch(e) { 
        console.error(e); 
        process.exit(1); 
    } 
} 
seed();
