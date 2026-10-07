const fs = require('fs');
let content = fs.readFileSync('src/sanity/schema.js', 'utf8');

// Add import
if (!content.includes('import { homepage }')) {
  content = content.replace("export const schemaTypes = [", "import { homepage } from './schema/homepage'\n\nexport const schemaTypes = [\n  homepage,");
}

// Add isFeatured to artwork
if (!content.includes("name: 'isFeatured'")) {
  const isFeaturedField = `
      {
        name: 'isFeatured',
        title: 'Feature on Homepage?',
        type: 'boolean',
        group: 'content',
        description: 'Toggle YES to instantly add this photo to the homepage featured ticker.',
        initialValue: false
      },`;
  // Inject right after name: 'title' in artwork schema
  content = content.replace("name: 'fileName',", "name: 'fileName'," + isFeaturedField);
}

fs.writeFileSync('src/sanity/schema.js', content);
console.log('Schema updated.');
