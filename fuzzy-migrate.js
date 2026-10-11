const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config({ path: '.env.local' });

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET;
const TOKEN = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_TOKEN;

function walkSync(dir, filelist = []) {
  if (!fs.existsSync(dir)) return filelist;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    try {
      if (fs.statSync(filepath).isDirectory()) {
        filelist = walkSync(filepath, filelist);
      } else {
        if (file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.jpeg')) {
          filelist.push(file);
        }
      }
    } catch(e) {}
  }
  return filelist;
}

const meadowlensFiles = walkSync('E:\\Meadowlens Photos');
const zbirdsFiles = walkSync('E:\\Z Birds Birds Birds');
const allLocalFiles = [...new Set([...meadowlensFiles, ...zbirdsFiles])];

const serialMap = {};
for (const file of allLocalFiles) {
    const fallbackMatch = file.match(/^([a-zA-Z\s\-']+).*?(P[A-Z]?\d{4,}|DMC\d+|DSC\d+)/i);
    if (fallbackMatch && fallbackMatch[1].trim().length > 2) {
         serialMap[fallbackMatch[2].toUpperCase()] = fallbackMatch[1].trim();
    }
}

console.log(`Extracted ${Object.keys(serialMap).length} unique serial mappings from local drives.`);

const query = encodeURIComponent(`*[_type == "artwork" && !defined(species) && defined(fileName)][0...2000]{_id, fileName, title}`);
const fetchUrl = `https://${PROJECT_ID}.api.sanity.io/v2021-06-07/data/query/${DATASET}?query=${query}`;

https.get(fetchUrl, { headers: { Authorization: `Bearer ${TOKEN}` } }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    const artworks = json.result || [];
    
    const mutations = [];
    
    for (const art of artworks) {
        let matchedName = null;
        
        // 1. Try to extract serial from Sanity fileName
        const artSerialMatch = art.fileName.match(/(P[A-Z]?\d{4,}|DMC\d+|DSC\d+)/i);
        if (artSerialMatch) {
            const artSerial = artSerialMatch[1].toUpperCase();
            if (serialMap[artSerial]) {
                matchedName = serialMap[artSerial];
            }
        }
        
        // 2. Try to extract serial from Sanity title (if fileName didn't work)
        if (!matchedName && art.title) {
            const titleSerialMatch = art.title.match(/(P[A-Z]?\d{4,}|DMC\d+|DSC\d+)/i);
            if (titleSerialMatch) {
                const titleSerial = titleSerialMatch[1].toUpperCase();
                if (serialMap[titleSerial]) {
                    matchedName = serialMap[titleSerial];
                }
            }
        }

        if (matchedName) {
            mutations.push({
                patch: {
                    id: art._id,
                    set: {
                        title: matchedName,
                        displayTitle: matchedName,
                        species: matchedName
                    }
                }
            });
        }
    }
    
    console.log(`Found ${mutations.length} artworks out of ${artworks.length} to fix!`);

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
