const mysql = require('mysql2/promise');
require('dotenv').config();

// Local DB connection
const localPool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'rudra@2007',
    database: process.env.DB_NAME || 'gdg_cn',
});

// Railway DB connection
const railwayPool = mysql.createPool({
    uri: process.env.DB_URL,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function migrate() {
    try {
        console.log("Starting Migration from Local MySQL to Railway...");
        const [tables] = await localPool.query("SHOW TABLES;");
        
        // We will need to disable foreign key checks during migration
        await railwayPool.query("SET FOREIGN_KEY_CHECKS = 0;");
        
        for (const t of tables) {
            const tableName = Object.values(t)[0];
            console.log(`\n--- Migrating table: ${tableName} ---`);
            
            // Get create table syntax
            const [createTableResult] = await localPool.query(`SHOW CREATE TABLE ${tableName};`);
            const createTableSql = createTableResult[0]['Create Table'];
            
            // Create table on Railway (DROP it first if it exists to be safe)
            console.log(`Creating table ${tableName} on Railway...`);
            await railwayPool.query(`DROP TABLE IF EXISTS ${tableName};`);
            await railwayPool.query(createTableSql);
            
            // Fetch all data
            console.log(`Fetching data for ${tableName}...`);
            const [rows] = await localPool.query(`SELECT * FROM ${tableName}`);
            
            if (rows.length > 0) {
                // Insert data
                const columns = Object.keys(rows[0]);
                const values = rows.map(r => columns.map(col => r[col]));
                
                const sql = `INSERT IGNORE INTO ${tableName} (${columns.join(', ')}) VALUES ?`;
                
                await railwayPool.query(sql, [values]);
                console.log(`Successfully migrated ${rows.length} rows for ${tableName}`);
            } else {
                console.log(`No data to migrate for ${tableName}`);
            }
        }
        await railwayPool.query("SET FOREIGN_KEY_CHECKS = 1;");
        console.log("\n✅ Migration completed successfully!");
    } catch(e) {
        console.error("❌ Migration Error:", e);
    } finally {
        process.exit();
    }
}
migrate();
