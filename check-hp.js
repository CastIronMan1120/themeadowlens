const { createClient } = require('@sanity/client');
require('dotenv').config({ path: '.env.local' });
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: false,
  apiVersion: '2024-01-01'
});
async function run() {
    const data = await client.fetch(`*[_type == "homepage"][0]{ "f": featuredArtworks[]->title }`);
    console.log(data);
}
run();
