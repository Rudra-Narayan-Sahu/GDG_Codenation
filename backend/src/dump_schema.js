const pool = require('./config/db');
const fs = require('fs');

async function check() {
    try {
        const [tables] = await pool.query("SHOW TABLES;");
        let out = "";
        for (const t of tables) {
            const tableName = Object.values(t)[0];
            const [schema] = await pool.query(`DESCRIBE ${tableName};`);
            out += `\n--- SCHEMA FOR ${tableName} ---\n`;
            out += JSON.stringify(schema.map(r => ({Field: r.Field, Type: r.Type, Null: r.Null})), null, 2);
        }
        fs.writeFileSync('db_schema.json', out);
    } catch(e) {
        console.error("DB Error:", e);
    } finally {
        process.exit();
    }
}
check();
