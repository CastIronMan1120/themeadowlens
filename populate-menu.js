const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'h7ncr8cq',
  dataset: 'production',
  apiVersion: '2023-05-03',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
});

async function run() {
  const categories = await client.fetch('*[_type == "category"]');
  for (const cat of categories) {
    const query = '*[_type == "artwork" && references($id)][0]';
    const art = await client.fetch(query, { id: cat._id });
    if (art && art.image) {
      console.log('Patching ' + cat.title + ' with image from ' + art.title);
      await client.patch(cat._id).set({ menuImage: art.image }).commit();
    } else {
      console.log('No artwork found for ' + cat.title);
    }
  }
  console.log('Done!');
}
run();
