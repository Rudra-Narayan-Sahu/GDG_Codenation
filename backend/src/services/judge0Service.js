const axios = require('axios');
require('dotenv').config();

const JUDGE0_API_URL = process.env.JUDGE0_API_URL;
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;

// Language mapping based on Judge0 CE (Standard IDs)
// Using general IDs: 50 (C), 54 (C++), 62 (Java), 71 (Python)
const getLanguageId = (language) => {
    switch(language.toLowerCase()) {
        case 'c': return 50;
        case 'c++':
        case 'cpp': return 54;
        case 'java': return 62;
        case 'python': return 71;
        default: return 71; // Default to Python
    }
};

/**
 * Submit code to Judge0 for execution against a specific test case
 * @param {string} source_code 
 * @param {string} language 
 * @param {string} stdin - Input for the test case
 * @param {string} expected_output - Expected output for validation
 * @returns {object} Result object containing status, time, memory, etc.
 */
exports.submitToJudge0 = async (source_code, language, stdin, expected_output) => {
    const language_id = getLanguageId(language);
    
    // Prepare payload
    const options = {
        method: 'POST',
        url: `${JUDGE0_API_URL}/submissions`,
        params: { base64_encoded: 'false', wait: 'true' }, // Wait=true -> synchronous execution mapping
        headers: {
            'content-type': 'application/json',
            'Content-Type': 'application/json',
            'X-RapidAPI-Key': JUDGE0_API_KEY,
            'X-RapidAPI-Host': new URL(JUDGE0_API_URL).hostname
        },
        data: {
            source_code,
            language_id,
            stdin,
            expected_output
        }
    };

    try {
        const response = await axios.request(options);
        return response.data; // Includes status, time, memory, stdout, stderr, compile_output
    } catch (error) {
        console.error("Judge0 API Error:", error.response ? error.response.data : error.message);
        throw error;
    }
};
