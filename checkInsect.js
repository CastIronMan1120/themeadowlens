const { createClient } = require('@sanity/client')
const client = createClient({
  projectId: 'h7ncr8cq', dataset: 'production', useCdn: false,
  token: process.env.SANITY_TOKEN, apiVersion: '2021-06-07'
})
client.fetch(`*[_type == "artwork" && category->title == "Insects"][0]`).then(console.log)
