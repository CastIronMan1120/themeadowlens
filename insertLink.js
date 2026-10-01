const fs = require('fs');
let content = fs.readFileSync('src/app/components/Navigation.jsx', 'utf8');

// Insert desktop link
content = content.replace(
  '<Link href="/artist" className="text-white uppercase tracking-widest text-xs font-semibold hover:text-neutral-400 transition-colors">',
  '<Link href="/bird-index" className="text-white uppercase tracking-widest text-xs font-semibold hover:text-neutral-400 transition-colors">\n              Species Index\n            </Link>\n\n            <Link href="/artist" className="text-white uppercase tracking-widest text-xs font-semibold hover:text-neutral-400 transition-colors">'
);

// Insert mobile link
content = content.replace(
  '<Link href="/artist" onClick={() => setMobileMenuOpen(false)} className="text-3xl font-light text-white/80">The Artist</Link>',
  '<Link href="/bird-index" onClick={() => setMobileMenuOpen(false)} className="text-3xl font-light text-white/80">Species Index</Link>\n          <Link href="/artist" onClick={() => setMobileMenuOpen(false)} className="text-3xl font-light text-white/80">The Artist</Link>'
);

fs.writeFileSync('src/app/components/Navigation.jsx', content, 'utf8');
