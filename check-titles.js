const { createClient } = require('@sanity/client');
require('dotenv').config({ path: '.env.local' });
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: false,
  apiVersion: '2024-01-01'
});
async function check() {
    const arts = await client.fetch(`*[_type == "artwork" && defined(image.asset)] | order(_createdAt desc)[0...5]{title}`);
    console.log("Recent Titles:", arts.map(a => a.title).join(', '));
}
check();
