const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    
    // In src/app/(frontend)/category/[...slug]/page.js
    // Old: '../../sanity/lib/client'
    // New: '../../../../sanity/lib/client'
    // Old: '../../components/Gallery'
    // New: '../../../components/Gallery'
    
    // Instead of doing it blindly, let's look at the errors:
    
    if (filePath.includes('art\\[slug]\\page.js') || filePath.includes('art/[slug]/page.js')) {
        content = content.replace(/..\/..\/..\/sanity/g, '../../../../sanity');
        content = content.replace(/..\/..\/components/g, '../../../components');
    }
    else if (filePath.includes('category\\[...slug]\\page.js') || filePath.includes('category/[...slug]/page.js')) {
        content = content.replace(/..\/..\/..\/sanity/g, '../../../../sanity');
        content = content.replace(/..\/..\/components/g, '../../../components');
    }
    else if (filePath.includes('species\\[speciesName]\\page.js') || filePath.includes('species/[speciesName]/page.js')) {
        content = content.replace(/..\/..\/..\/sanity/g, '../../../../sanity');
        content = content.replace(/..\/..\/components/g, '../../../components');
    }
    else if (filePath.includes('artist\\page.js') || filePath.includes('artist/page.js') || filePath.includes('bird-index\\page.js') || filePath.includes('bird-index/page.js') || filePath.includes('news\\page.js') || filePath.includes('news/page.js')) {
        content = content.replace(/..\/..\/sanity/g, '../../../sanity');
    }

    fs.writeFileSync(filePath, content);
}

const files = [
    'src/app/(frontend)/art/[slug]/page.js',
    'src/app/(frontend)/category/[...slug]/page.js',
    'src/app/(frontend)/species/[speciesName]/page.js',
    'src/app/(frontend)/artist/page.js',
    'src/app/(frontend)/bird-index/page.js',
    'src/app/(frontend)/news/page.js'
];

files.forEach(replaceInFile);
console.log('Fixed imports');
