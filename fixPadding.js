const fs = require('fs');
let content = fs.readFileSync('src/app/category/[...slug]/page.js', 'utf8');

content = content.replace(
  '<main className="min-h-screen bg-neutral-950 pt-32 pb-24">',
  '<main className="min-h-screen bg-neutral-950 pt-56 pb-24 px-6 md:px-12 max-w-[2000px] mx-auto">'
);

fs.writeFileSync('src/app/category/[...slug]/page.js', content, 'utf8');
