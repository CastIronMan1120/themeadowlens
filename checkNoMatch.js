const { createClient } = require('@sanity/client')

const client = createClient({
  projectId: 'h7ncr8cq',
  dataset: 'production',
  useCdn: false,
  token: process.env.SANITY_TOKEN,
  apiVersion: '2021-06-07'
})

async function run() {
  const artworks = await client.fetch(`*[_type == "artwork" && !title match "*Study*"]{title}[0..20]`)
  console.log(artworks.map(a => a.title))
}

run().catch(console.error)
