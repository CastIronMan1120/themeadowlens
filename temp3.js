const fs = require('fs');
let content = fs.readFileSync('src/app/category/[...slug]/page.js', 'utf8');
content = content.replace(
  '<Gallery artworks={artworks} />',
  '<Gallery artworks={artworks} fallbackDescription={category.speciesDescription} />'
);
fs.writeFileSync('src/app/category/[...slug]/page.js', content, 'utf8');
