const https = require('https');
require('dotenv').config({ path: '.env.local' });

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET;
const TOKEN = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_TOKEN;

const query = encodeURIComponent(`*[_type == "artwork" && !defined(species)][0...2000]{_id}`);
const fetchUrl = `https://${PROJECT_ID}.api.sanity.io/v2021-06-07/data/query/${DATASET}?query=${query}`;

https.get(fetchUrl, { headers: { Authorization: `Bearer ${TOKEN}` } }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    const artworks = json.result || [];
    
    const mutations = artworks.map(art => ({
      delete: {
        id: art._id
      }
    }));

    console.log(`Deleting ${mutations.length} unnamed artworks.`);

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
