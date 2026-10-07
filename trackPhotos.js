const fs = require('fs')
const { createClient } = require('@sanity/client')
const client = createClient({
  projectId: 'h7ncr8cq', dataset: 'production', useCdn: false,
  token: process.env.SANITY_TOKEN, apiVersion: '2021-06-07'
})

function countFiles(dir) {
  if (!fs.existsSync(dir)) return 0
  let total = 0
  const files = fs.readdirSync(dir, { withFileTypes: true })
  for (const f of files) {
    if (f.isDirectory()) total += countFiles(dir + '\\' + f.name)
    else if (f.name.match(/\.(jpg|jpeg|png)$/i)) total++
  }
  return total
}

const eDriveBirds = countFiles('E:\\Meadowlens Photos\\Birds')
const eDriveFlora = countFiles('E:\\Meadowlens Photos\\Flora')
const eDriveFauna = countFiles('E:\\Meadowlens Photos\\Fauna')

async function run() {
  const dbBirds = await client.fetch(`count(*[_type == "artwork" && category._ref == "ki2CkCtDpGl4l8rsJaSSx7" ])`) // Wait, need correct refs!
  
  const categories = await client.fetch(`*[_type == "category"]{_id, title}`)
  const catMap = {}
  categories.forEach(c => catMap[c.title.toLowerCase()] = c._id)
  
  const countDb = async (title) => {
    return await client.fetch(`count(*[_type == "artwork" && category._ref == $id])`, { id: catMap[title] })
  }
  
  console.log('E-Drive Birds:', eDriveBirds, 'DB Birds:', await countDb('birds'))
  console.log('E-Drive Flora:', eDriveFlora, 'DB Flora:', await countDb('flora'))
  console.log('E-Drive Fauna:', eDriveFauna, 'DB Fauna:', await countDb('fauna'))
}
run()
