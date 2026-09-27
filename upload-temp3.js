const fs = require('fs');
const path = require('path');
const { createClient } = require('@sanity/client');

// NOTE: Set the SANITY_API_WRITE_TOKEN in your environment or replace it here before running
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!token) {
    console.error("Error: SANITY_API_WRITE_TOKEN is missing. Please provide it.");
    process.exit(1);
}

const client = createClient({
  projectId: 'h7ncr8cq', // From handover doc
  dataset: 'production',
  apiVersion: '2023-05-03',
  useCdn: false,
  token: token,
});

async function uploadPhotos() {
    const baseDir = 'E:\\Meadowlens Photos\\Birds';
    
    if (!fs.existsSync(baseDir)) {
        console.error(`Error: Directory ${baseDir} not found.`);
        return;
    }

    const files = fs.readdirSync(baseDir).filter(f => f.toLowerCase().endsWith('.jpg'));
    console.log(`Found ${files.length} photos to upload. Beginning sequence...`);

    // First, find the "Birds" category document ID
    const categories = await client.fetch(`*[_type == "category" && title == "Birds"]{_id}`);
    if (categories.length === 0) {
        console.error("Error: Could not find the 'Birds' category in Sanity. Please create it in the studio first.");
        return;
    }
    const categoryId = categories[0]._id;

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filePath = path.join(baseDir, file);
        const title = file.replace(/\.jpg$/i, ''); // e.g. "American Kestrel - Study 001"
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

        try {
            console.log(`[${i+1}/${files.length}] Uploading image for: ${title}...`);
            const imageAsset = await client.assets.upload('image', fs.createReadStream(filePath), {
                filename: file
            });

            console.log(`[${i+1}/${files.length}] Creating artwork document: ${title}...`);
            await client.create({
                _type: 'artwork',
                title: title,
                slug: { _type: 'slug', current: slug },
                image: {
                    _type: 'image',
                    asset: {
                        _type: 'reference',
                        _ref: imageAsset._id
                    }
                },
                category: {
                    _type: 'reference',
                    _ref: categoryId
                },
                status: 'available',
                roomSetting: 'living-room'
            });
            console.log(`✅ Successfully uploaded and cataloged: ${title}\n`);
        } catch (error) {
            console.error(`❌ Failed to upload ${file}:`, error.message);
        }
    }

    console.log("Bulk upload complete!");
}

uploadPhotos();
