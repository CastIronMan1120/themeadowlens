const fs = require('fs');
const https = require('https');
require('dotenv').config({ path: '.env.local' });

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET;
const TOKEN = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_TOKEN;

const localFiles = fs.readFileSync('local_files.txt', 'utf8').split('\n').map(s => s.trim()).filter(Boolean);

// Create a robust map based on the 7-digit serial numbers
const serialMap = {};
for (const file of localFiles) {
    const prefixMatch = file.match(/^(.+?)\s+.*?\d{2}-.*?(P\d+|DMC\d+|DSC\d+|P[A-Z]\d+)/i);
    if (prefixMatch) {
        const birdName = prefixMatch[1].trim();
        const serial = prefixMatch[2].trim().toUpperCase(); // e.g. P1051969
        serialMap[serial] = birdName;
    } else {
        // Just extract the serial if possible and guess the bird name from the start of the string
        const fallbackMatch = file.match(/^([a-zA-Z\s\-']+).*?(P\d{6,}|DMC\d+|DSC\d+|P[A-Z]\d{6,})/i);
        if (fallbackMatch && fallbackMatch[1].trim().length > 2) {
             serialMap[fallbackMatch[2].toUpperCase()] = fallbackMatch[1].trim();
        }
    }
}

const query = encodeURIComponent(`*[_type == "artwork" && !defined(species) && defined(fileName)][0...2000]{_id, fileName}`);
const fetchUrl = `https://${PROJECT_ID}.api.sanity.io/v2021-06-07/data/query/${DATASET}?query=${query}`;

https.get(fetchUrl, { headers: { Authorization: `Bearer ${TOKEN}` } }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    const artworks = json.result || [];
    let matchCount = 0;
    
    for (const art of artworks) {
        const artSerialMatch = art.fileName.match(/(P\d{6,}|DMC\d+|DSC\d+|P[A-Z]\d{6,})/i);
        if (artSerialMatch) {
            const artSerial = artSerialMatch[1].toUpperCase();
            if (serialMap[artSerial]) {
                matchCount++;
                // console.log(`Matched Sanity ${art.fileName} -> ${serialMap[artSerial]}`);
            }
        }
    }
    console.log(`Total Unnamed in Sanity: ${artworks.length}`);
    console.log(`Fuzzy Serial Matches Found: ${matchCount}`);
  });
});
