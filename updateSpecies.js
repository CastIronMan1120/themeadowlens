const fs = require('fs');
let content = fs.readFileSync('src/app/species/[speciesName]/page.js', 'utf8');

content = content.replace(
  '`*[_type == "artwork" && species == $decodedSpecies] | order(_createdAt desc)',
  '`*[_type == "artwork" && species == $decodedSpecies && (category->slug.current in ["birds", "fauna"] || category->parentCategory->slug.current in ["birds", "fauna"])] | order(_createdAt desc)'
);

fs.writeFileSync('src/app/species/[speciesName]/page.js', content, 'utf8');
