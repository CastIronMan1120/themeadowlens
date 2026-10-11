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
    const featuredCat = await client.fetch(`*[_type == "category" && slug.current == "featured-works"][0]`);
    if (featuredCat) {
        await client.delete(featuredCat._id);
        console.log("Deleted Featured Works category tile.");
    }
}
run();
