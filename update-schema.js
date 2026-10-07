const fs = require('fs');
let content = fs.readFileSync('src/sanity/schema.js', 'utf8');

if (!content.includes('import { homepage }')) {
  content = content.replace("export const schemaTypes = [", "import { homepage } from './schema/homepage'\n\nexport const schemaTypes = [\n  homepage,");
}

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
  // Inject right BEFORE name: 'fileName' object, by matching the exact object start
  content = content.replace("      {\n        name: 'fileName',", isFeaturedField + "\n      {\n        name: 'fileName',");
}

fs.writeFileSync('src/sanity/schema.js', content);
console.log('Schema updated.');
