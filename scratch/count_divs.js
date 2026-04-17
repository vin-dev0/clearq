
import fs from 'fs';

const content = fs.readFileSync('/home/subzero/Projects/simplyticket/src/app/(admin)/admin/security/page.tsx', 'utf8');
const lines = content.split('\n');

let level = 0;
lines.forEach((line, i) => {
    const opens = (line.match(/<div/g) || []).length;
    const closes = (line.match(/<\/div>/g) || []).length;
    level += opens;
    level -= closes;
    if (line.includes('<div') || line.includes('</div>')) {
        console.log(`${i + 1}: level ${level} (${line.trim()})`);
    }
});
