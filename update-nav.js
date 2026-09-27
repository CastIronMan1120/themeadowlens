const fs = require('fs');
const file = 'src/app/components/Navigation.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/<a href="mailto:dmc1120@themeadowlens\.com"/g, '<Link href="?inquire=true" scroll={false}');
content = content.replace(/<\/a>/g, function(match, offset, string) {
    // A bit hacky, let's just replace specific known blocks.
    return match;
});

// Since we replaced <a href="..."> with <Link href="...">, we need to replace the corresponding </a> with </Link>
// Let's do string replacement for the exact lines.

content = content.replace(
    /<Link href="\?inquire=true" scroll={false} className="text-neutral-300 hover:text-white transition-colors text-sm uppercase tracking-widest font-mono flex items-center group\/social pt-4 border-t border-white\/10">\s*<span className="mr-3 text-neutral-500 group-hover\/social:text-white transition-colors">✉<\/span> Email\s*<\/a>/g,
    '<Link href="?inquire=true" scroll={false} className="text-neutral-300 hover:text-white transition-colors text-sm uppercase tracking-widest font-mono flex items-center group/social pt-4 border-t border-white/10">\n                        <span className="mr-3 text-neutral-500 group-hover/social:text-white transition-colors">✉</span> Email\n                      </Link>'
);

content = content.replace(
    /<Link href="\?inquire=true" scroll={false} className="text-white uppercase tracking-widest text-xs font-semibold hover:text-neutral-400 transition-colors">\s*Inquiries & Comments\s*<\/a>/g,
    '<Link href="?inquire=true" scroll={false} className="text-white uppercase tracking-widest text-xs font-semibold hover:text-neutral-400 transition-colors">\n              Inquiries & Comments\n            </Link>'
);

content = content.replace(
    /<Link href="\?inquire=true" scroll={false} className="text-3xl font-light text-white\/80">Inquiries & Comments<\/a>/g,
    '<Link href="?inquire=true" scroll={false} className="text-3xl font-light text-white/80">Inquiries & Comments</Link>'
);

fs.writeFileSync(file, content);
console.log("Done");
