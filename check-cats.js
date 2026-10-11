const { createClient } = require('@sanity/client');
require('dotenv').config({ path: '.env.local' });
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: false,
  apiVersion: '2024-01-01'
});
async function check() {
    const cats = await client.fetch(`*[_type == "category"]{title}`);
    console.log("Categories:", cats.map(c => c.title).join(', '));
}
check();
