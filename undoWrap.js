const fs = require('fs');

let nav = fs.readFileSync('src/app/components/Navigation.jsx', 'utf8');
nav = nav.replace('leading-relaxed whitespace-nowrap', 'leading-relaxed');
fs.writeFileSync('src/app/components/Navigation.jsx', nav, 'utf8');
