const pool = require('./config/db');

async function migrate() {
    try {
        console.log("Starting DB Migration...");
        const [result] = await pool.query("ALTER TABLE users MODIFY password VARCHAR(255) NULL;");
        console.log("Migration Success:", result);
    } catch(e) {
        console.error("Migration Failed:", e);
    } finally {
        process.exit();
    }
}
migrate();
