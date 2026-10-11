const { createClient } = require('@sanity/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_TOKEN,
  useCdn: false,
  apiVersion: '2024-01-01'
});

async function test() {
   try {
      const doc = await client.fetch('count(*[_type == "artwork"])');
      console.log(`Artwork count: ${doc}`);
   } catch (e) {
      console.error(e);
   }
}
test();
