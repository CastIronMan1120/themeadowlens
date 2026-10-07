const { createClient } = require('@sanity/client')
const client = createClient({
  projectId: 'h7ncr8cq', dataset: 'production', useCdn: false,
  token: process.env.SANITY_TOKEN, apiVersion: '2021-06-07'
})
client.fetch(`count(*[_type == "artwork" && !defined(image.asset)])`).then(c => console.log('Missing images:', c))
client.fetch(`count(*[_type == "artwork" && !defined(slug.current)])`).then(c => console.log('Missing slugs:', c))
