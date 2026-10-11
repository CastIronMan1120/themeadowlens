const fs = require('fs');
const localFiles = fs.readFileSync('local_files.txt', 'utf8').split('\n').map(s => s.trim()).filter(Boolean);
const serialMap = {};
for (const file of localFiles) {
    const fallbackMatch = file.match(/^([a-zA-Z\s\-']+).*?(P[A-Z]?\d{4,}|DMC\d+|DSC\d+)/i);
    if (fallbackMatch && fallbackMatch[1].trim().length > 2) {
         serialMap[fallbackMatch[2].toUpperCase()] = fallbackMatch[1].trim();
    }
}
console.log(Object.keys(serialMap).slice(0, 20));
console.log(Object.values(serialMap).slice(0, 20));
