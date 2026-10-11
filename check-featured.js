const { createClient } = require('@sanity/client');
require('dotenv').config({ path: '.env.local' });
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: false,
  apiVersion: '2024-01-01'
});
async function check() {
    const count = await client.fetch(`count(*[_type == "artwork" && isFeatured == true])`);
    console.log("Featured Photos Count:", count);
}
check();
