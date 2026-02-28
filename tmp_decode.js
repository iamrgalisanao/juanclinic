const fs = require('fs');

const raw = fs.readFileSync('C:\\Users\\midnight\\.gemini\\antigravity\\brain\\110550e3-6e02-49de-b208-0eb9c6e07b98\\.system_generated\\steps\\1405\\output.txt', 'utf8');

// The Firecrawl output includes ANSI escape codes and the "Screenshot saved to" text before the base64 output
const lines = raw.split('\n');
let base64Data = '';

for (const line of lines) {
    // Only capture the actual base64 string lines (removing the prefix text)
    if (!line.includes('Screenshot saved') && !line.includes('✓') && line.trim().length > 0) {
        base64Data += line.trim();
    }
}

const buffer = Buffer.from(base64Data, 'base64');
fs.writeFileSync('E:\\2026\\Clinic\\backend\\storage\\app\\public\\screenshots\\appointments_calendar.png', buffer);
console.log('Saved image successfully');
