const axios = require('axios');
const pool = require('./config/db');

async function testSubmit() {
    try {
        console.log("Fetching a user from DB...");
        const [users] = await pool.query("SELECT * FROM users LIMIT 1");
        if (users.length === 0) {
            console.log("No users in DB");
            process.exit(0);
        }
        
        const user = users[0];
        console.log("Got user:", user.email);

        // Generate token manually bypassing login to be quick
        const jwt = require('jsonwebtoken');
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'my_super_secret_jwt_key_123', { expiresIn: '1d' });
        
        const problemId = 1; // Assuming problem 1 exists (Two sum)

        console.log(`Submitting problem ${problemId} as user ${user.id} ...`);
        
        const res = await axios.post('http://localhost:5000/api/submissions', {
            problemId: problemId,
            language: 'python',
            code: 'print("hello")'
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        console.log("Submission was successful!");
        console.log(res.data);

    } catch (error) {
        console.error("Submission failed with error:");
        if (error.response) {
            console.error(error.response.status);
            console.error(error.response.data);
        } else {
            console.error(error.message);
        }
    } finally {
        process.exit();
    }
}

testSubmit();
