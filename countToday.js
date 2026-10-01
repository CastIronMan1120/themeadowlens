const { createClient } = require('@sanity/client')
const client = createClient({
  projectId: 'h7ncr8cq', dataset: 'production', useCdn: false,
  token: process.env.SANITY_TOKEN, apiVersion: '2021-06-07'
})
client.fetch(`count(*[_type == "artwork" && _createdAt > "2026-10-01T00:00:00Z"])`).then(c => console.log('Count:', c))
