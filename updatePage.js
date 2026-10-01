const fs = require('fs');

// 1. Fix Slogan Wrap in Navigation.jsx
let nav = fs.readFileSync('src/app/components/Navigation.jsx', 'utf8');
nav = nav.replace('leading-relaxed', 'leading-relaxed whitespace-nowrap');
fs.writeFileSync('src/app/components/Navigation.jsx', nav, 'utf8');

// 2. Remove Gray Couch Fallback in Category Page
let cat = fs.readFileSync('src/app/category/[...slug]/page.js', 'utf8');
cat = cat.replace(
  '`url(\'${sub.imageUrl || "/room-preview.jpg"}\')`',
  '`url(\'${sub.imageUrl || ""}\')`'
);
fs.writeFileSync('src/app/category/[...slug]/page.js', cat, 'utf8');

