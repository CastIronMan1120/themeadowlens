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
        await client.patch('homepage')
            .set({ 
                featuredTickerSpeed: 60,
                newTickerSpeed: 50
            })
            .commit();
        console.log("Successfully updated default ticker speeds!");
    } catch(e) {
        console.error(e);
    }
}
run();
