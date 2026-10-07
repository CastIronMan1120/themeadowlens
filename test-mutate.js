const fs = require('fs');
const https = require('https');
require('dotenv').config({ path: '.env.local' });

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET;
const TOKEN = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_TOKEN || process.env.SANITY_API_TOKEN;

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
    console.log("Response:", mData);
  });
});

const testMutation = {
  mutations: [
    {
      patch: {
        id: "0BS5Ps1IOSuzr6xL2n6fpo",
        set: { isFeatured: true }
      }
    }
  ]
};

req.write(JSON.stringify(testMutation));
req.end();
