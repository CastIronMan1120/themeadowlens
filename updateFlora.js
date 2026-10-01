const fs = require('fs');

function updateQuery(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(
    'category->slug.current in ["birds", "fauna"] || category->parentCategory->slug.current in ["birds", "fauna"]',
    'category->slug.current in ["birds", "fauna", "flora"] || category->parentCategory->slug.current in ["birds", "fauna", "flora"]'
  );
  fs.writeFileSync(filePath, content, 'utf8');
}

updateQuery('src/app/bird-index/page.js');
updateQuery('src/app/species/[speciesName]/page.js');
