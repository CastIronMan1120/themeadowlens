const { createClient } = require('@sanity/client')

const client = createClient({
  projectId: 'h7ncr8cq',
  dataset: 'production',
  useCdn: false,
  token: process.env.SANITY_TOKEN,
  apiVersion: '2021-06-07'
})

async function run() {
  const query = `*[_type == "artwork" && defined(species) && (category->slug.current in ["birds", "fauna"] || category->parentCategory->slug.current in ["birds", "fauna"])].species`
  const result = await client.fetch(query)
  const unique = [...new Set(result)].sort()
  console.log(unique)
}

run().catch(console.error)
