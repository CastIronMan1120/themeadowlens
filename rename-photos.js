const fs = require('fs');
const path = require('path');

const srcDir = 'E:\\Meadowlens Photos';
const destDir = path.join(srcDir, 'Birds');

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir);
}

const species = ['Kestrel', 'Goldfinches'];

species.forEach(sp => {
    const spDir = path.join(srcDir, sp);
    if (fs.existsSync(spDir)) {
        const files = fs.readdirSync(spDir).filter(f => f.toLowerCase().endsWith('.jpg'));
        files.forEach((f, i) => {
            const prefix = sp === 'Kestrel' ? 'American Kestrel' : 'American Goldfinch';
            const num = String(i + 1).padStart(3, '0'); // e.g., 001, 002
            const newName = `${prefix} - Study ${num}.jpg`;
            fs.renameSync(path.join(spDir, f), path.join(destDir, newName));
        });
        console.log(`Renamed and moved ${files.length} ${sp} photos.`);
    }
});
