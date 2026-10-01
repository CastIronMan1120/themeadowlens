const { createClient } = require('@sanity/client')
const fs = require('fs')
const path = require('path')

const client = createClient({
  projectId: 'h7ncr8cq', dataset: 'production', useCdn: false,
  token: process.env.SANITY_TOKEN, apiVersion: '2021-06-07'
})

const PHOTOS_DIR = 'E:\\Meadowlens Photos'

function slugify(text) {
  return text.toString().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
}

async function run() {
  const categories = await client.fetch(`*[_type == "category"]{_id, title}`)
  const catMap = {}
  categories.forEach(c => { catMap[c.title.toLowerCase().trim()] = c._id })
  catMap["reflections and splashes"] = catMap["captioned works"] // mapping to fallback if needed, or skip
  catMap["sky and heavens"] = catMap["vistas, landscapes and scenes"] // mapping sky to vistas

  const existingArtworks = await client.fetch(`*[_type == "artwork"]{fileName}`)
  const existingNames = new Set(existingArtworks.filter(a => a.fileName).map(a => a.fileName))

  const folders = fs.readdirSync(PHOTOS_DIR, { withFileTypes: true }).filter(d => d.isDirectory())

  for (const folder of folders) {
    const folderName = folder.name
    const folderPath = path.join(PHOTOS_DIR, folderName)
    const categoryId = catMap[folderName.toLowerCase().trim()]

    if (!categoryId) { continue }

    const files = fs.readdirSync(folderPath).filter(f => f.match(/\.(jpg|jpeg|png|gif|tif|tiff|nef)$/i))
    for (const file of files) {
      if (existingNames.has(file)) { continue }

      const filePath = path.join(folderPath, file)
      const baseName = path.parse(file).name
      const slug = slugify(baseName)

      console.log(`Uploading ${file}...`)
      try {
        const stream = fs.createReadStream(filePath)
        stream.on('error', (err) => {
          console.error(`ReadStream error on ${file}:`, err.message)
        })

        const imageAsset = await client.assets.upload('image', stream, { filename: file })

        const doc = {
          _type: 'artwork', title: baseName, displayTitle: baseName, fileName: file,
          slug: { _type: 'slug', current: slug },
          image: { _type: 'image', asset: { _type: "reference", _ref: imageAsset._id } },
          category: { _type: 'reference', _ref: categoryId },
          status: 'available'
        }

        await client.create(doc)
        console.log(`? Successfully created artwork: ${baseName}`)
      } catch (err) {
        console.error(`? Failed to upload ${file}:`, err.message)
      }
    }
  }
}

run().catch(console.error)
