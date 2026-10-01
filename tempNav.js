const fs = require('fs');
let content = fs.readFileSync('src/app/components/Navigation.jsx', 'utf8');

content = content.replace(
  '<Link href="/artist" className="text-white hover:text-neutral-400 uppercase text-xs md:text-sm tracking-widest transition-colors font-semibold">The Artist</Link>',
  '<Link href="/bird-index" className="text-white hover:text-neutral-400 uppercase text-xs md:text-sm tracking-widest transition-colors font-semibold">Species Index</Link>\n            <Link href="/artist" className="text-white hover:text-neutral-400 uppercase text-xs md:text-sm tracking-widest transition-colors font-semibold">The Artist</Link>'
);

fs.writeFileSync('src/app/components/Navigation.jsx', content, 'utf8');
