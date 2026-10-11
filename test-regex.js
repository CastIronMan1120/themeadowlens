const fs = require('fs');

const localFiles = fs.readFileSync('local_files.txt', 'utf8').split('\n').filter(Boolean);
let suffixMatches = 0;
let fallbackMatches = 0;
let pcMatches = 0;

for (const file of localFiles) {
    if (file.includes('-PC') || file.includes('-PB') || file.includes('-PA') || file.includes('-DMC') || file.includes('-DSC')) pcMatches++;
    const prefixMatch = file.match(/^(.+?)\s+(\d{2}-.*\.jpe?g)$/i);
    if (prefixMatch) {
        suffixMatches++;
    } else {
        fallbackMatches++;
    }
}
console.log(`Suffix matched: ${suffixMatches}, Fallbacks: ${fallbackMatches}, Other Formats: ${pcMatches}`);
