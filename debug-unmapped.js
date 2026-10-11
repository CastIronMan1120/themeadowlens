const https = require('https');
require('dotenv').config({ path: '.env.local' });

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET;
const TOKEN = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_TOKEN;

const query = encodeURIComponent(`*[_type == "artwork" && !defined(species) && defined(fileName)][0...50]{_id, fileName, title}`);
const fetchUrl = `https://${PROJECT_ID}.api.sanity.io/v2021-06-07/data/query/${DATASET}?query=${query}`;

https.get(fetchUrl, { headers: { Authorization: `Bearer ${TOKEN}` } }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    const artworks = json.result || [];
    console.log(artworks.map(a => a.fileName));
  });
});
