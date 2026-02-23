const pool = require('./config/db');

async function check() {
    try {
        const [tables] = await pool.query("SHOW TABLES;");
        console.log("TABLES:", tables);
        for (const t of tables) {
            const tableName = Object.values(t)[0];
            const [schema] = await pool.query(`DESCRIBE ${tableName};`);
            console.log(`\n--- SCHEMA FOR ${tableName} ---`);
            console.log(JSON.stringify(schema.map(r => ({Field: r.Field, Type: r.Type, Null: r.Null})), null, 2));
        }
    } catch(e) {
        console.error("DB Error:", e);
    } finally {
        process.exit();
    }
}
check();
