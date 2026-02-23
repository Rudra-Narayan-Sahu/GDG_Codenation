const pool = require('./config/db');

async function check() {
    try {
        const [rows] = await pool.query("DESCRIBE users;");
        console.log("USERS TABLE SCHEMA:");
        console.log(JSON.stringify(rows, null, 2));
    } catch(e) {
        console.error("DB Error:", e);
    } finally {
        process.exit();
    }
}
check();
