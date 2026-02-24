import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // 1. Single quotes: 'http://localhost:5000/api/...' -> `${import.meta.env.VITE_API_URL}/api/...`
    if (/'http:\/\/localhost:5000\/([^']*)'/.test(content)) {
        content = content.replace(/'http:\/\/localhost:5000\/([^']*)'/g, '`${import.meta.env.VITE_API_URL}/$1`');
        modified = true;
    }

    // 2. Double quotes: "http://localhost:5000/api/..." -> `${import.meta.env.VITE_API_URL}/api/...`
    if (/"http:\/\/localhost:5000\/([^"]*)"/.test(content)) {
        content = content.replace(/"http:\/\/localhost:5000\/([^"]*)"/g, '`${import.meta.env.VITE_API_URL}/$1`');
        modified = true;
    }

    // 3. Template literals: `http://localhost:5000/api/...` -> `${import.meta.env.VITE_API_URL}/api/...`
    if (/`http:\/\/localhost:5000\/([^`]*)`/.test(content)) {
        content = content.replace(/`http:\/\/localhost:5000\/([^`]*)`/g, '`${import.meta.env.VITE_API_URL}/$1`');
        modified = true;
    }

    // 4. Any leftover http://localhost:5000 like in exact strings 'http://localhost:5000/api/auth' that didn't match above or plain text
    if (/http:\/\/localhost:5000/.test(content)) {
        content = content.replace(/http:\/\/localhost:5000/g, '${import.meta.env.VITE_API_URL}');
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${filePath}`);
    }
}

function traverse(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverse(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            replaceInFile(fullPath);
        }
    }
}

traverse(path.join(__dirname, 'src'));
console.log('Done replacing URLs');
