const { createClient } = require('@sanity/client')
const fs = require('fs')
const path = require('path')

const client = createClient({
  projectId: 'h7ncr8cq',
  dataset: 'production',
  useCdn: false,
  token: process.env.SANITY_TOKEN,
  apiVersion: '2021-06-07'
})

const PHOTOS_DIR = 'E:\\Meadowlens Photos'

function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

async function run() {
  console.log('Fetching existing categories...')
  const categories = await client.fetch(`*[_type == "category"]{_id, title}`)
  
  // Create a map of lowercased category title to _id
  const catMap = {}
  categories.forEach(c => {
    catMap[c.title.toLowerCase().trim()] = c._id
  })

  // We will also keep track of existing artworks by fileName so we don't duplicate
  const existingArtworks = await client.fetch(`*[_type == "artwork"]{fileName}`)
  const existingNames = new Set(existingArtworks.filter(a => a.fileName).map(a => a.fileName))

  const folders = fs.readdirSync(PHOTOS_DIR, { withFileTypes: true }).filter(d => d.isDirectory())

  for (const folder of folders) {
    const folderName = folder.name
    const folderPath = path.join(PHOTOS_DIR, folderName)
    const categoryId = catMap[folderName.toLowerCase().trim()]

    if (!categoryId) {
      console.log(`WARNING: No matching category found in Sanity for folder "${folderName}". Skipping...`)
      continue
    }

    const files = fs.readdirSync(folderPath).filter(f => f.match(/\.(jpg|jpeg|png|gif|tif|tiff|nef)$/i))
    console.log(`Found ${files.length} images in "${folderName}"`)

    for (const file of files) {
      if (existingNames.has(file)) {
        console.log(`Skipping ${file} (Already exists in Sanity)`)
        continue
      }

      const filePath = path.join(folderPath, file)
      const baseName = path.parse(file).name // e.g. "American Kestrel - Study 001"
      
      // Personal File Name: American Kestrel - Study 001.jpg
      // SEO Title: American Kestrel - Study 001
      // Caption Title (Display): American Kestrel - Study 001
      const slug = slugify(baseName)

      console.log(`Uploading ${file}...`)
      try {
        const imageAsset = await client.assets.upload('image', fs.createReadStream(filePath), {
          filename: file
        })

        const doc = {
          _type: 'artwork',
          title: baseName,
          displayTitle: baseName,
          fileName: file,
          slug: {
            _type: 'slug',
            current: slug
          },
          image: {
            _type: 'image',
            asset: {
              _type: "reference",
              _ref: imageAsset._id
            }
          },
          category: {
            _type: 'reference',
            _ref: categoryId
          },
          status: 'available'
        }

        await client.create(doc)
        console.log(`? Successfully created artwork: ${baseName}`)
      } catch (err) {
        console.error(`? Failed to upload ${file}:`, err.message)
      }
    }
  }

  console.log('DONE MIGRATION!')
}

run().catch(console.error)
