const fs = require('fs');
let content = fs.readFileSync('src/app/components/Navigation.jsx', 'utf8');

// Update slogan font size and color
content = content.replace(
  'className="text-white/80 font-mono text-[9px] md:text-[11px] uppercase tracking-widest mt-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] max-w-sm md:max-w-3xl leading-relaxed"',
  'className="text-neutral-300 font-mono text-[10px] md:text-sm uppercase tracking-widest mt-3 drop-shadow-md max-w-sm md:max-w-3xl leading-relaxed"'
);

fs.writeFileSync('src/app/components/Navigation.jsx', content, 'utf8');
