const fs = require('fs');
const path = require('path');
const appDir = path.join(__dirname, 'src/app');
const frontendDir = path.join(appDir, '(frontend)');

// 1. Create (frontend)
if (!fs.existsSync(frontendDir)) fs.mkdirSync(frontendDir);

// 2. Move folders
const foldersToMove = ['art', 'artist', 'bird-index', 'category', 'news', 'species'];
for (const folder of foldersToMove) {
    if (fs.existsSync(path.join(appDir, folder))) {
        fs.renameSync(path.join(appDir, folder), path.join(frontendDir, folder));
    }
}

// 3. Move page.js
if (fs.existsSync(path.join(appDir, 'page.js'))) {
    fs.renameSync(path.join(appDir, 'page.js'), path.join(frontendDir, 'page.js'));
}

console.log("Moved folders to (frontend)");
