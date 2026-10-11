const fs = require('fs');
const path = require('path');

const dirs = [
  'art/[slug]',
  'category/[...slug]',
  'artist',
  'bird-index',
  'news'
];

dirs.forEach(dir => {
  const file = path.join('src/app/(frontend)', dir, 'page.js');
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace standard padding with robust dynamic padding that clears the massive desktop header
    content = content.replace(/className="min-h-screen pt-24/g, 'className="min-h-screen pt-40 md:pt-[240px]');
    content = content.replace(/className="min-h-screen pt-32/g, 'className="min-h-screen pt-40 md:pt-[240px]');
    
    fs.writeFileSync(file, content);
  }
});
console.log("Updated padding on all internal pages.");
