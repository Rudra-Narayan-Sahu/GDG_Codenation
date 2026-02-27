require('dotenv').config();
const pool = require('./config/db');

async function migrate() {
    console.log("Starting topics migration...");
    try {
        await pool.query('ALTER TABLE problems ADD COLUMN topics VARCHAR(255) DEFAULT "";');
        console.log("Migration successful: Added topics to problems table");
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log("Column topics already exists, skipping.");
        } else {
            console.error("Migration failed:", error);
        }
    } finally {
        process.exit();
    }
}

migrate();
