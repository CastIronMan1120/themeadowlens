const fs = require('fs');
const { createClient } = require('@sanity/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_TOKEN,
  useCdn: false,
  apiVersion: '2024-01-01'
});

async function run() {
    try {
        console.log("Uploading frontal lens image...");
        const imgPath = 'C:/Users/Gabriel/.gemini/antigravity/brain/34c59ea7-301f-4d16-b28c-d26f43c24d52/meadowlens_frontal_lens_1791414432407.jpg';
        const asset = await client.assets.upload('image', fs.createReadStream(imgPath), { filename: 'frontal-lens.jpg' });
        console.log("Asset uploaded:", asset._id);
        
        console.log("Patching homepage document...");
        await client.patch('homepage').set({
            heroImage: { _type: 'image', asset: { _ref: asset._id } }
        }).commit();
        console.log("Success!");
    } catch (e) {
        console.error(e);
    }
}

run();
