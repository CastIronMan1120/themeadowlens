const fs = require('fs');

function fixWidth(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(
    'max-w-[2000px] mx-auto"',
    'w-full max-w-[2000px] mx-auto"'
  );
  fs.writeFileSync(filePath, content, 'utf8');
}

fixWidth('src/app/category/[...slug]/page.js');
fixWidth('src/app/species/[speciesName]/page.js');
fixWidth('src/app/bird-index/page.js');

