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
        const existing = await client.fetch(`*[_type == "category" && slug.current == "featured-works"][0]`);
        if (existing) {
            console.log("Featured Works category already exists.");
            return;
        }
        await client.create({
            _type: 'category',
            title: 'Featured Works',
            slug: { _type: 'slug', current: 'featured-works' }
        });
        console.log("Successfully created 'Featured Works' category.");
    } catch(e) {
        console.error(e);
    }
}
run();
