const fs = require('fs');
const raw = fs.readFileSync('C:\\Users\\midnight\\.gemini\\antigravity\\brain\\110550e3-6e02-49de-b208-0eb9c6e07b98\\.system_generated\\steps\\1532\\output.txt', 'utf8');

const lines = raw.split('\n');
let base64Data = '';
for (const line of lines) {
    if (!line.includes('Screenshot saved') && !line.includes('✓') && line.trim().length > 0) {
        base64Data += line.trim();
    }
}

const buffer = Buffer.from(base64Data, 'base64');
fs.writeFileSync('C:\\Users\\midnight\\.gemini\\antigravity\\brain\\110550e3-6e02-49de-b208-0eb9c6e07b98\\appointments_calendar_v2.png', buffer);
console.log('Saved image successfully');
