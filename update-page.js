const fs = require('fs');
let page = fs.readFileSync('src/app/(frontend)/page.js', 'utf8');

// Update GROQ Query
page = page.replace(/tickerSpeed,/, 'featuredTickerSpeed,\n    newTickerSpeed,');

// Change Title
page = page.replace(/Featured Masterpieces/g, 'Featured Works');

// Update Ticker 1 Speed
page = page.replace(/speed=\{homepage\?\.tickerSpeed \|\| 120\}/, 'speed={homepage?.featuredTickerSpeed || 120}');

// Update Ticker 2 Speed
page = page.replace(/speed=\{\(homepage\?\.tickerSpeed \|\| 120\) \* 0\.85\}/, 'speed={homepage?.newTickerSpeed || 100}');

fs.writeFileSync('src/app/(frontend)/page.js', page);
