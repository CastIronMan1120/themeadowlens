const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { createClient } = require('@sanity/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_TOKEN,
  useCdn: false,
  apiVersion: '2024-01-01'
});

function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

function walkSync(dir, filelist = []) {
  if (!fs.existsSync(dir)) return filelist;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    try {
      if (fs.statSync(filepath).isDirectory()) {
        filelist = walkSync(filepath, filelist);
      } else {
        if (file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.jpeg')) {
          filelist.push({ file, filepath });
        }
      }
    } catch(e) {}
  }
  return filelist;
}

async function run() {
    console.log("Scanning E:\\Z BIRDS BIRDS BIRDS...");
    const allFiles = walkSync('E:\\Z BIRDS BIRDS BIRDS');
    console.log(`Found ${allFiles.length} photos to upload. Beginning bulk pipeline...`);
    
    let uploadedCount = 0;
    let skippedCount = 0;
    
    // Fetch existing slugs to prevent duplicating files that are already on the site
    const existingDocs = await client.fetch('*[_type == "artwork"]{slug}');
    const existingSlugs = new Set(existingDocs.map(d => d.slug?.current).filter(Boolean));
    
    for (let i = 0; i < allFiles.length; i++) {
        const { file, filepath } = allFiles[i];
        
        // Extract Name from the filename intelligently
        let cleanName = file.replace(/\.jpe?g$/i, '').trim();
        const fallbackMatch = file.match(/^([a-zA-Z\s\-']+).*?(P[A-Z]?\d{4,}|DMC\d+|DSC\d+)/i);
        if (fallbackMatch && fallbackMatch[1].trim().length > 2) {
             cleanName = fallbackMatch[1].trim();
        }
        
        // Create a unique, SEO-friendly slug
        const hash = crypto.createHash('md5').update(file).digest('hex').substring(0, 4);
        const slug = `${slugify(cleanName)}-${hash}`;
        
        if (existingSlugs.has(slug)) {
            console.log(`[${i+1}/${allFiles.length}] Skipping ${file} (Already in database)`);
            skippedCount++;
            continue;
        }
        
        try {
            console.log(`[${i+1}/${allFiles.length}] Uploading ${file} -> Title: "${cleanName}"`);
            
            // Upload the heavy high-res image blob
            const asset = await client.assets.upload('image', fs.createReadStream(filepath), { filename: file });
            
            // Create the Artwork Document (safely omitting category so it goes to "Missing a Venue")
            const docId = 'drafts.' + crypto.randomUUID();
            await client.create({
                _id: docId,
                _type: 'artwork',
                title: cleanName,
                displayTitle: cleanName,
                species: cleanName,
                slug: { _type: 'slug', current: slug },
                image: { _type: 'image', asset: { _ref: asset._id } }
            });
            
            uploadedCount++;
            existingSlugs.add(slug); 
        } catch(e) {
            console.error(`Failed to upload ${file}: ${e.message}`);
        }
    }
    
    console.log(`\nALL UPLOADS COMPLETE! Successfully uploaded: ${uploadedCount}. Skipped: ${skippedCount}`);
}

run();

