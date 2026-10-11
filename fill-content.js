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
        await client.createIfNotExists({ _id: 'homepage', _type: 'homepage' });
        
        // Fetch some high quality photos to populate the Featured Ticker
        const artworks = await client.fetch(`*[_type == "artwork" && defined(image.asset)][0...10]{_id}`);
        const refs = artworks.map(a => ({ _key: a._id, _type: 'reference', _ref: a._id }));

        await client.patch('homepage')
            .setIfMissing({ welcomeHeadline: 'Welcome to The Meadow Lens' })
            .set({ 
                welcomeHeadline: 'Welcome to The Meadow Lens',
                quote: 'Laughter and Nature is the best medicine!',
                tickerSpeed: 120,
                featuredArtworks: refs,
                welcomeText: [
                    {
                        _type: 'block',
                        _key: 'b1',
                        style: 'normal',
                        markDefs: [],
                        children: [{ _type: 'span', _key: 's1', text: 'I am David McClure, a fine art photographer with a lifelong passion for capturing the raw, uninterrupted beauty of nature. For years, I have explored the hidden depths of the New Jersey Meadowlands and beyond, waiting for those fleeting moments of perfection.', marks: [] }]
                    },
                    {
                        _type: 'block',
                        _key: 'b2',
                        style: 'normal',
                        markDefs: [],
                        children: [{ _type: 'span', _key: 's2', text: 'This gallery is a curated exhibition of my life\'s work—from the aggressive grace of birds of prey to the tranquil stillness of untouched vistas. I invite you to step into these digital halls and explore the world through my lens.', marks: [] }]
                    }
                ]
            })
            .commit();
        console.log("Successfully populated Homepage content!");
    } catch(e) {
        console.error(e);
    }
}
run();
