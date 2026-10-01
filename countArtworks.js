const { createClient } = require('@sanity/client')

const client = createClient({
  projectId: 'h7ncr8cq',
  dataset: 'production',
  useCdn: false,
  token: process.env.SANITY_TOKEN,
  apiVersion: '2021-06-07'
})

async function run() {
  const artworks = await client.fetch(`count(*[_type == "artwork"])`)
  console.log(`Total artworks in Sanity: ${artworks}`)
}

run().catch(console.error)
