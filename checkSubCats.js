const { createClient } = require('@sanity/client')
const client = createClient({
  projectId: 'h7ncr8cq', dataset: 'production', useCdn: false,
  token: process.env.SANITY_TOKEN, apiVersion: '2021-06-07'
})
async function run() {
  const cats = await client.fetch(`*[_type == "category" && defined(parentCategory)]{title, "count": count(*[_type == "artwork" && category._ref == ^._id])}`)
  console.log(cats)
}
run()
