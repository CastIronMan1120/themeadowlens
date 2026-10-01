const { createClient } = require('@sanity/client')

const client = createClient({
  projectId: 'h7ncr8cq',
  dataset: 'production',
  useCdn: false,
  token: process.env.SANITY_TOKEN,
  apiVersion: '2021-06-07'
})

async function run() {
  const artworks = await client.fetch(`*[_type == "artwork" && !defined(species)]`)
  
  const mutations = []

  artworks.forEach(artwork => {
    const title = artwork.title || ''
    
    // Check if it follows the "Species Name - Study xxx" pattern
    if (title.includes(' - Study')) {
      const parts = title.split(' - Study')
      const speciesName = parts[0].trim()
      
      // Ensure it's not empty and doesn't look like a raw code
      if (speciesName.length > 2 && !speciesName.match(/^[0-9]+-P/)) {
        mutations.push({
          patch: {
            id: artwork._id,
            set: {
              species: speciesName
            }
          }
        })
      }
    }
  })

  console.log(`Found ${mutations.length} artworks to patch with a species name!`)

  // Execute in batches of 100 to avoid Sanity payload limits
  const BATCH_SIZE = 100
  for (let i = 0; i < mutations.length; i += BATCH_SIZE) {
    const batch = mutations.slice(i, i + BATCH_SIZE)
    console.log(`Submitting batch ${i / BATCH_SIZE + 1}...`)
    try {
      await client.mutate(batch)
      console.log(`Batch ${i / BATCH_SIZE + 1} succeeded.`)
    } catch (err) {
      console.error(`Batch failed:`, err.message)
    }
  }
  
  console.log('Finished updating species fields!')
}

run().catch(console.error)
