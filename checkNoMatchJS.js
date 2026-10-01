const { createClient } = require('@sanity/client')

const client = createClient({
  projectId: 'h7ncr8cq',
  dataset: 'production',
  useCdn: false,
  token: process.env.SANITY_TOKEN,
  apiVersion: '2021-06-07'
})

async function run() {
  const artworks = await client.fetch(`*[_type == "artwork"]{title}`)
  const noMatch = artworks.filter(a => !a.title.includes(' - Study')).map(a => a.title)
  console.log(noMatch.slice(0, 30))
}

run().catch(console.error)
