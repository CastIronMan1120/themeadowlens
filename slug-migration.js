const https = require('https');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET;
const TOKEN = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_TOKEN;

function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

const query = encodeURIComponent(`*[_type == "artwork"][0...2000]{_id, title, slug}`);
const fetchUrl = `https://${PROJECT_ID}.api.sanity.io/v2021-06-07/data/query/${DATASET}?query=${query}`;

https.get(fetchUrl, { headers: { Authorization: `Bearer ${TOKEN}` } }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    const artworks = json.result || [];
    const mutations = [];

    for (const art of artworks) {
      if (!art.title) continue;
      
      const cleanSlugStr = slugify(art.title);
      // Generate a tiny 4-char hash based on the ID so it's deterministic but unique
      const hash = crypto.createHash('md5').update(art._id).digest('hex').substring(0, 4);
      const newSlug = `${cleanSlugStr}-${hash}`;

      // Only update if the current slug doesn't already match the new pattern
      if (!art.slug || art.slug.current !== newSlug) {
        const patchObj = {
          id: art._id,
          set: {
            slug: {
              _type: 'slug',
              current: newSlug
            }
          }
        };
        mutations.push({ patch: patchObj });
      }
    }

    console.log(`Found ${mutations.length} slugs to fix.`);

    if (mutations.length === 0) return;

    const CHUNK_SIZE = 50;
    let chunksProcessed = 0;
    
    function sendChunk(chunk) {
      const mutateUrl = `https://${PROJECT_ID}.api.sanity.io/v2021-06-07/data/mutate/${DATASET}`;
      const req = https.request(mutateUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` }
      }, (mRes) => {
        let mData = '';
        mRes.on('data', c => mData += c);
        mRes.on('end', () => {
          chunksProcessed++;
          console.log(`Chunk ${chunksProcessed} complete. Status: ${mRes.statusCode}`);
        });
      });
      req.write(JSON.stringify({ mutations: chunk }));
      req.end();
    }

    for (let i = 0; i < mutations.length; i += CHUNK_SIZE) {
      sendChunk(mutations.slice(i, i + CHUNK_SIZE));
    }
  });
});
