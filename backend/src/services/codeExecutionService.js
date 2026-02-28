const https = require('https');

// ─── Judge0 CE Language IDs ───────────────────────────────────────────────────
// Using the free public Judge0 CE instance at ce.judge0.com
const JUDGE0_LANG_IDS = {
    'python':     71,  // Python 3.8.1
    'javascript': 63,  // JavaScript (Node.js 12.14.0)
    'js':         63,
    'java':       62,  // Java (OpenJDK 13.0.1)
    'c':          50,  // C (GCC 9.2.0)
    'c++':        54,  // C++ (GCC 9.2.0)
    'cpp':        54,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const toBase64   = (str) => Buffer.from(str  || '').toString('base64');
const fromBase64 = (str) => str ? Buffer.from(str, 'base64').toString('utf8') : '';

/**
 * Submit a single test case to Judge0 CE (free public API, no key needed).
 */
const runWithJudge0 = (langId, code, input) => {
    return new Promise((resolve) => {
        const body = JSON.stringify({
            source_code:     toBase64(code),
            language_id:     langId,
            stdin:           toBase64(input || ''),
            cpu_time_limit:  5,
            wall_time_limit: 10,
        });

        const options = {
            hostname: 'ce.judge0.com',
            path:     '/submissions?base64_encoded=true&wait=true',
            method:   'POST',
            headers: {
                'Content-Type':   'application/json',
                'Content-Length': Buffer.byteLength(body),
            },
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    // Judge0 status IDs:
                    // 1=In Queue, 2=Processing, 3=Accepted, 4=Wrong Answer(unused here),
                    // 5=TLE, 6=Compile Error, 7-12=Runtime Errors
                    const statusId      = result.status?.id;
                    const stdout        = fromBase64(result.stdout);
                    const stderr        = fromBase64(result.stderr);
                    const compileOutput = fromBase64(result.compile_output);

                    if (statusId === 5)                    return resolve({ timedOut: true });
                    if (statusId === 6)                    return resolve({ compileError: compileOutput || stderr || 'Compile Error' });
                    if (statusId >= 7 && statusId <= 12)   return resolve({ runtimeError: stderr || compileOutput || 'Runtime Error' });
                    if (statusId === 3)                    return resolve({ stdout, time: parseFloat(result.time || '0') });
                    // Fallback for statuses 1, 2 or unknown
                    return resolve({ stdout, runtimeError: stderr || null });
                } catch (e) {
                    resolve({ runtimeError: 'Failed to parse Judge0 response: ' + e.message });
                }
            });
        });

        req.on('error', (e) => resolve({ runtimeError: 'Judge0 connection error: ' + e.message }));
        req.setTimeout(15000, () => { req.destroy(); resolve({ timedOut: true }); });
        req.write(body);
        req.end();
    });
};

// ─── Main Export ──────────────────────────────────────────────────────────────
/**
 * Executes code against test cases using Judge0 CE.
 * Returns: { status, passed, total, runtime, compileError, runtimeError, actualOutput, expectedOutput, failedTestCase }
 */
exports.executeCode = async (language, problemId, code, testCases) => {
    if (!testCases || testCases.length === 0) {
        return { status: 'Accepted', passed: 0, total: 0, runtime: 0 };
    }

    const langLower = language.toLowerCase();
    const langId    = JUDGE0_LANG_IDS[langLower];

    if (!langId) {
        return {
            status: 'System Error',
            passed: 0,
            total: testCases.length,
            runtimeError: `Unsupported language: ${language}. Supported: Python, JavaScript, Java, C, C++`,
        };
    }

    let passedCount  = 0;
    let totalRuntime = 0;

    for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        const result   = await runWithJudge0(langId, code, testCase.input);

        if (result.compileError) {
            return {
                status:       'Compile Error',
                passed:       0,
                total:        testCases.length,
                compileError: result.compileError,
            };
        }

        if (result.timedOut) {
            return {
                status:         'Time Limit Exceeded',
                passed:         passedCount,
                total:          testCases.length,
                failedTestCase: testCase,
            };
        }

        if (result.runtimeError) {
            return {
                status:         'Runtime Error',
                passed:         passedCount,
                total:          testCases.length,
                failedTestCase: testCase,
                runtimeError:   result.runtimeError,
            };
        }

        const actualOutput   = (result.stdout || '').trim().replace(/\r\n/g, '\n');
        const expectedOutput = (testCase.expected_output || '').trim().replace(/\r\n/g, '\n');

        if (actualOutput !== expectedOutput) {
            return {
                status:         'Wrong Answer',
                passed:         passedCount,
                total:          testCases.length,
                failedTestCase: testCase,
                actualOutput,
                expectedOutput,
            };
        }

        passedCount++;
        totalRuntime += result.time || 0;
    }

    return {
        status:  'Accepted',
        passed:  passedCount,
        total:   testCases.length,
        runtime: parseFloat((totalRuntime / testCases.length).toFixed(3)),
    };
};
