const fs = require('fs');
let content = fs.readFileSync('src/app/bird-index/page.js', 'utf8');

content = content.replace(
  '`*[_type == "artwork" && defined(species)].species`',
  '`*[_type == "artwork" && defined(species) && (category->slug.current in ["birds", "fauna"] || category->parentCategory->slug.current in ["birds", "fauna"])].species`'
);

fs.writeFileSync('src/app/bird-index/page.js', content, 'utf8');
