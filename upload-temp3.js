const { createClient } = require('next-sanity');

const client = createClient({
  projectId: 'h7ncr8cq',
  dataset: 'production',
  useCdn: false,
  token: 'skYzuhSCf0j3AgpNTiyS0aASlUwemOsrKkQ2cBwE4WFDH51flJEFt2hKFXtOJ9HbkhoT6KFnqJ319aQbIctIN50MInTRUdZ6d9aMB8CNpWGV6KHyjDzPxSWpqM1CW6eoxUHU5NWommrfhHfDh1CaANxyhN8HmQAC4DUEhhJ4h789jSsYUSp9',
  apiVersion: '2023-05-03'
});

const placeholders = [
  { name: 'Birds', url: 'https://images.unsplash.com/photo-1444464666168-49b6288f615e?q=80&w=1200&auto=format&fit=crop&fm=jpg' },
  { name: 'Fauna', url: 'https://images.unsplash.com/photo-1549366021-9f761d450615?q=80&w=1200&auto=format&fit=crop&fm=jpg' },
  { name: 'Flora', url: 'https://images.unsplash.com/photo-1457089328109-e5d9bd499191?q=80&w=1200&auto=format&fit=crop&fm=jpg' },
  { name: 'Sky & Heavens', url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200&auto=format&fit=crop&fm=jpg' },
  { name: 'Vistas & Scenery', url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1200&auto=format&fit=crop&fm=jpg' },
  { name: 'Captioned Works', url: 'https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?q=80&w=1200&auto=format&fit=crop&fm=jpg' },
  { name: 'Compilations', url: 'https://images.unsplash.com/photo-1505296883204-633b6f28f522?q=80&w=1200&auto=format&fit=crop&fm=jpg' },
  { name: 'Everything', url: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=1200&auto=format&fit=crop&fm=jpg' }
];

async function run() {
  const rootVenues = await client.fetch('*[_type == "category" && !defined(parentCategory)]');
  
  for (const venue of rootVenues) {
    if (venue.menuImage) continue; // skip already uploaded
    const placeholder = placeholders.find(p => p.name === venue.title);
    if (!placeholder) continue;

    console.log(`Downloading placeholder for ${venue.title}...`);
    const imageRes = await fetch(placeholder.url);
    const imageBuffer = await imageRes.arrayBuffer();
    
    console.log(`Uploading asset to Sanity for ${venue.title}...`);
    const asset = await client.assets.upload('image', Buffer.from(imageBuffer), {
      filename: `${venue.slug.current}-placeholder.jpg`
    });

    console.log(`Patching ${venue.title}...`);
    await client.patch(venue._id)
      .set({
        menuImage: {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: asset._id
          }
        }
      })
      .commit();
      
    console.log(`Done with ${venue.title}!\n`);
  }
}

run().catch(console.error);
