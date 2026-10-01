const fs = require('fs');
let content = fs.readFileSync('src/app/page.js', 'utf8');

// 1. Update the GROQ query to hide utility categories
content = content.replace(
  '*[_type == "category" && !defined(parentCategory)] | order(title asc)',
  '*[_type == "category" && !defined(parentCategory) && !(title in ["Everything", "Compilations", "Captioned Works", "Guest Photos"])] | order(title asc)'
);

// 2. Increase padding on the Welcome section to stop it from squishing the header
content = content.replace(
  'pt-32 pb-16 px-6 md:px-12',
  'pt-48 pb-16 px-6 md:px-12'
);

fs.writeFileSync('src/app/page.js', content, 'utf8');
