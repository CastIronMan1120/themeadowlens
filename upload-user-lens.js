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
        console.log("Uploading the user's specific Meadow Lens graphic...");
        const imgPath = 'C:/Users/Gabriel/.gemini/antigravity/brain/34c59ea7-301f-4d16-b28c-d26f43c24d52/.user_uploaded/media_1791414460100.png';
        const asset = await client.assets.upload('image', fs.createReadStream(imgPath), { filename: 'the-meadow-lens.png' });
        console.log("Asset uploaded:", asset._id);
        
        console.log("Creating or patching homepage document...");
        
        // Ensure the homepage document exists
        await client.createIfNotExists({
            _id: 'homepage',
            _type: 'homepage',
            welcomeHeadline: 'Welcome!',
            welcomeText: []
        });
        
        await client.patch('homepage').set({
            heroImage: { _type: 'image', asset: { _ref: asset._id } }
        }).commit();
        
        console.log("Success! The image is live on the homepage.");
    } catch (e) {
        console.error(e);
    }
}

run();
