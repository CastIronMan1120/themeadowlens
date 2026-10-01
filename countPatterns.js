const { createClient } = require('@sanity/client')

const client = createClient({
  projectId: 'h7ncr8cq',
  dataset: 'production',
  useCdn: false,
  token: process.env.SANITY_TOKEN,
  apiVersion: '2021-06-07'
})

async function run() {
  const artworks = await client.fetch(`*[_type == "artwork"]{_id, title}`)
  
  let matchCount = 0
  let noMatchCount = 0
  
  artworks.forEach(a => {
    if (a.title.includes(' - Study')) matchCount++
    else noMatchCount++
  })
  
  console.log(`Matched ' - Study': ${matchCount}`)
  console.log(`No match: ${noMatchCount}`)
}

run().catch(console.error)
