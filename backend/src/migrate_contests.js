const pool = require('./config/db');

async function createContestTables() {
    try {
        console.log("Starting Contest Table Migrations...");
        
        // 1. Create contests table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS contests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                start_time TIMESTAMP NOT NULL,
                end_time TIMESTAMP NOT NULL,
                created_by INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
            )
        `);
        console.log("Created table: contests");

        // 2. Create contest_problems table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS contest_problems (
                contest_id INT NOT NULL,
                problem_id INT NOT NULL,
                points INT DEFAULT 100,
                PRIMARY KEY (contest_id, problem_id),
                FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE,
                FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
            )
        `);
        console.log("Created table: contest_problems");

        // 3. Create contest_participants table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS contest_participants (
                contest_id INT NOT NULL,
                user_id INT NOT NULL,
                joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                score INT DEFAULT 0,
                penalty INT DEFAULT 0,
                PRIMARY KEY (contest_id, user_id),
                FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log("Created table: contest_participants");

        // 4. Modify submissions table to optionally link to a contest
        // First check if column exists before trying to add it
        const [columns] = await pool.query("SHOW COLUMNS FROM submissions LIKE 'contest_id'");
        if (columns.length === 0) {
            await pool.query(`
                ALTER TABLE submissions
                ADD COLUMN contest_id INT NULL,
                ADD FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE SET NULL
            `);
            console.log("Added contest_id to submissions table");
        } else {
            console.log("contest_id already exists in submissions table");
        }

        console.log("Contest Table Migrations Complete!");

    } catch(e) {
        console.error("Migration Failed:", e);
    } finally {
        process.exit();
    }
}

createContestTables();
