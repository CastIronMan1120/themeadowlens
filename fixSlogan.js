const fs = require('fs');
let content = fs.readFileSync('src/app/components/Navigation.jsx', 'utf8');

content = content.replace(
  'max-w-sm md:max-w-md',
  'max-w-sm md:max-w-3xl'
);

content = content.replace(
  'tracking-[0.2em] md:tracking-[0.3em]',
  'tracking-widest'
);

fs.writeFileSync('src/app/components/Navigation.jsx', content, 'utf8');
