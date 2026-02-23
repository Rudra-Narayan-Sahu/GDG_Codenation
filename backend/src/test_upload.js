const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

async function testUpload() {
    try {
        console.log("Logging in...");
        // Assume user exists or we can register one. The DB user is 'root', db is 'gdg_cn'.
        // The user was testing so let's try a known user or skip the token if we can't.
        // Wait, I can just query the DB directly to get a valid token, or register a new user.
        const registerRes = await axios.post('http://localhost:5000/api/auth/register', {
            name: 'TestUser',
            email: 'testuser12345@test.com',
            password: 'password123'
        }).catch(err => err.response);

        let token;
        if (registerRes && registerRes.data && registerRes.data.token) {
            token = registerRes.data.token;
        } else {
            const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
                email: 'testuser12345@test.com',
                password: 'password123'
            }).catch(err => {
                console.error("Login failed:", err.response ? err.response.data : err.message);
                process.exit(1);
            });
            token = loginRes.data.token;
        }
        console.log("Got token.");

        // Now test upload
        const form = new FormData();
        form.append('name', 'Hacker Pro');
        // Let's create a dummy file to upload
        fs.writeFileSync('dummy.jpg', 'fake image content');
        form.append('profile_image', fs.createReadStream('dummy.jpg'));

        console.log("Sending PUT /api/auth/profile...");
        const putRes = await axios.put('http://localhost:5000/api/auth/profile', form, {
            headers: {
                ...form.getHeaders(),
                Authorization: `Bearer ${token}`
            }
        });
        console.log("Success! Response:", putRes.data);
    } catch(err) {
        console.error("Error in request:", err.response ? err.response.data : err.message);
    }
}
testUpload();
