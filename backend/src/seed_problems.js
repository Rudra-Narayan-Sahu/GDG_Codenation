const pool = require('./config/db');

const problems = [
    {
        title: "Two Sum",
        description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
        difficulty: "Easy",
        testCases: [
            {
                input: "[2,7,11,15]\n9",
                expected_output: "[0,1]",
                is_hidden: 0
            },
            {
                input: "[3,2,4]\n6",
                expected_output: "[1,2]",
                is_hidden: 0
            },
            {
                input: "[3,3]\n6",
                expected_output: "[0,1]",
                is_hidden: 1
            }
        ]
    },
    {
        title: "Reverse String",
        description: "Write a function that reverses a string. The input string is given as an array of characters `s`.\n\nYou must do this by modifying the input array in-place with O(1) extra memory.",
        difficulty: "Easy",
        testCases: [
            {
                input: "[\"h\",\"e\",\"l\",\"l\",\"o\"]",
                expected_output: "[\"o\",\"l\",\"l\",\"e\",\"h\"]",
                is_hidden: 0
            },
            {
                input: "[\"H\",\"a\",\"n\",\"n\",\"a\",\"h\"]",
                expected_output: "[\"h\",\"a\",\"n\",\"n\",\"a\",\"H\"]",
                is_hidden: 1
            }
        ]
    },
    {
        title: "Valid Palindrome",
        description: "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.\n\nGiven a string `s`, return `true` if it is a palindrome, or `false` otherwise.",
        difficulty: "Easy",
        testCases: [
            {
                input: "\"A man, a plan, a canal: Panama\"",
                expected_output: "true",
                is_hidden: 0
            },
            {
                input: "\"race a car\"",
                expected_output: "false",
                is_hidden: 0
            },
            {
                input: "\" \"",
                expected_output: "true",
                is_hidden: 1
            }
        ]
    },
    {
        title: "Maximum Subarray",
        description: "Given an integer array `nums`, find the subarray with the largest sum, and return its sum.",
        difficulty: "Medium",
        testCases: [
            {
                input: "[-2,1,-3,4,-1,2,1,-5,4]",
                expected_output: "6",
                is_hidden: 0
            },
            {
                input: "[1]",
                expected_output: "1",
                is_hidden: 0
            },
            {
                input: "[5,4,-1,7,8]",
                expected_output: "23",
                is_hidden: 1
            }
        ]
    }
];

async function seedProblems() {
    try {
        console.log("Starting problem seed...");

        // Start transaction
        await pool.query('START TRANSACTION');

        for (const problem of problems) {
            // Check if problem already exists
            const [existing] = await pool.query('SELECT id FROM problems WHERE title = ?', [problem.title]);
            if (existing.length > 0) {
                console.log(`Problem '${problem.title}' already exists. Skipping.`);
                continue;
            }

            // Insert problem. Assume Admin user ID 1 exists.
            const [result] = await pool.query(
                'INSERT INTO problems (title, description, difficulty, created_by, is_daily) VALUES (?, ?, ?, 1, 0)',
                [problem.title, problem.description, problem.difficulty]
            );

            const problemId = result.insertId;
            console.log(`Inserted problem: ${problem.title} with ID ${problemId}`);

            // Insert test cases
            for (const tc of problem.testCases) {
                await pool.query(
                    'INSERT INTO test_cases (problem_id, input, expected_output, is_hidden) VALUES (?, ?, ?, ?)',
                    [problemId, tc.input, tc.expected_output, tc.is_hidden]
                );
            }
            console.log(`Inserted ${problem.testCases.length} test cases for ${problem.title}`);
        }

        await pool.query('COMMIT');
        console.log("All problems seeded successfully!");

    } catch (error) {
        await pool.query('ROLLBACK');
        console.error("Failed to seed problems:", error);
    } finally {
        process.exit(0);
    }
}

seedProblems();
