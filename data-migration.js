const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config({ path: '.env.local' });

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET;
const TOKEN = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_TOKEN || process.env.SANITY_API_TOKEN;

if (!PROJECT_ID || !DATASET || !TOKEN) {
  console.error("Missing Sanity credentials in environment.");
  process.exit(1);
}

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
    } catch(e) {
      console.warn(`Skipping locked/corrupted file: ${filepath}`);
    }
  }
  return filelist;
}

const meadowlensFiles = walkSync('E:\\Meadowlens Photos');
const zbirdsFiles = walkSync('E:\\Z Birds Birds Birds');
const allLocalFiles = [...new Set([...meadowlensFiles, ...zbirdsFiles])];

const nameMap = {};

for (const file of allLocalFiles) {
  const prefixMatch = file.match(/^(.+?)\s+(\d{2}-P.*\.jpe?g)$/i);
  if (prefixMatch) {
    const birdName = prefixMatch[1].trim();
    const suffix = prefixMatch[2].trim();
    nameMap[file] = birdName;
    nameMap[suffix] = birdName;
    continue;
  }
  
  const studyMatch = file.match(/^(.+?)\s+-\s+Study/i);
  if (studyMatch) {
    const birdName = studyMatch[1].trim();
    nameMap[file] = birdName;
    continue;
  }

  const fallback = file.replace(/\.jpe?g$/i, '').trim();
  nameMap[file] = fallback;
}

const query = encodeURIComponent(`*[_type == "artwork" && defined(fileName)][0...2000]{_id, fileName, title, species, isFeatured}`);
const fetchUrl = `https://${PROJECT_ID}.api.sanity.io/v2021-06-07/data/query/${DATASET}?query=${query}`;

https.get(fetchUrl, { headers: { Authorization: `Bearer ${TOKEN}` } }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    const artworks = json.result || [];

    const mutations = [];
    let featuredCount = 0;

    for (const art of artworks) {
      if (art.fileName && nameMap[art.fileName]) {
        const cleanName = nameMap[art.fileName];
        
        const titleIsMessy = art.title === art.fileName || /^2\d-P/.test(art.title);
        const missingSpecies = !art.species;
        
        let shouldFeature = false;
        if (featuredCount < 12 && !art.isFeatured && Math.random() > 0.8) {
          shouldFeature = true;
          featuredCount++;
        }

        if (titleIsMessy || missingSpecies || shouldFeature) {
          const patchObj = {
            id: art._id,
            set: {}
          };

          if (titleIsMessy || missingSpecies) {
            patchObj.set.title = cleanName;
            patchObj.set.displayTitle = cleanName;
            patchObj.set.species = cleanName;
          }

          if (shouldFeature) {
            patchObj.set.isFeatured = true;
          }

          mutations.push({ patch: patchObj });
        }
      }
    }

    if (mutations.length === 0) {
      console.log("Nothing to do.");
      return;
    }

    const CHUNK_SIZE = 50;
    let chunksProcessed = 0;
    
    function sendChunk(chunk) {
      const mutateUrl = `https://${PROJECT_ID}.api.sanity.io/v2021-06-07/data/mutate/${DATASET}`;
      const req = https.request(mutateUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TOKEN}`
        }
      }, (mRes) => {
        let mData = '';
        mRes.on('data', c => mData += c);
        mRes.on('end', () => {
          chunksProcessed++;
          console.log(`Chunk ${chunksProcessed} complete. Status: ${mRes.statusCode}`);
          if (chunksProcessed === Math.ceil(mutations.length / CHUNK_SIZE)) {
             console.log("ALL DONE!");
          }
        });
      });
      req.write(JSON.stringify({ mutations: chunk }));
      req.end();
    }

    for (let i = 0; i < mutations.length; i += CHUNK_SIZE) {
      const chunk = mutations.slice(i, i + CHUNK_SIZE);
      sendChunk(chunk);
    }

  });
});
