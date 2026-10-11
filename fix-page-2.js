const fs = require('fs');
let page = fs.readFileSync('src/app/(frontend)/page.js', 'utf8');

// The file has literal string "`n`n" in it. We need to replace it with real newlines.
page = page.replace(/`n`n/g, '\n\n');
page = page.replace(/`n/g, '\n');

fs.writeFileSync('src/app/(frontend)/page.js', page);
