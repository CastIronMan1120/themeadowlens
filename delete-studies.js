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
        console.log("Searching for 'Study' sample photos...");
        const studies = await client.fetch(`*[_type == "artwork" && title match "Study*"]{_id, title}`);
        console.log(`Found ${studies.length} photos to delete.`);
        
        if (studies.length > 0) {
            const transaction = client.transaction();
            studies.forEach(s => {
                console.log("Deleting:", s.title);
                transaction.delete(s._id);
            });
            await transaction.commit();
            console.log("Successfully deleted all sample Study photos.");
        }
    } catch (e) {
        console.error(e);
    }
}

run();
