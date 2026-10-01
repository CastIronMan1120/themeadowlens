import { NextResponse } from 'next/server'
import { createClient } from '@sanity/client'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2021-06-07'
})

const CATEGORIES = [
  'Sunsets', 'City Skylines', 'Landscapes', 'Parks & Trails', 'Wooden Bridges', 
  'Bird Flocks', 'Snowscapes', 'Bodies of Water', 'Weather Scenes', 'Environment'
]

export async function POST(req) {
  try {
    const { apiKey } = await req.json()
    if (!apiKey) return NextResponse.json({ error: 'Missing apiKey' }, { status: 400 })

    // Find up to 5 Vistas artworks that have ugly titles (e.g. 19-P... or 24-P...)
    // Or lack a subcategory
    const artworksQuery = `*[_type == "artwork" && category._ref == "ki2CkCtDpGl4l8rsJaSSx7" && (displayTitle match "*-P*" || !defined(subcategory))][0...5]{
      _id,
      displayTitle,
      "imageUrl": image.asset->url
    }`
    const artworks = await client.fetch(artworksQuery)

    if (!artworks || artworks.length === 0) {
      return NextResponse.json({ processed: 0, message: 'All done!' })
    }

    // Get subcategory refs
    const subcatsQuery = `*[_type == "category" && parentCategory._ref == "ki2CkCtDpGl4l8rsJaSSx7"]{_id, title}`
    const subcats = await client.fetch(subcatsQuery)
    const subcatMap = {}
    subcats.forEach(s => { subcatMap[s.title.toLowerCase()] = s._id })

    let processed = 0
    let logs = []

    for (const art of artworks) {
      logs.push(`Processing ${art.displayTitle}...`)
      
      // Fetch image bytes
      const imgRes = await fetch(art.imageUrl)
      const buffer = await imgRes.arrayBuffer()
      const base64 = Buffer.from(buffer).toString('base64')

      // Call Gemini API
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`
      
      const payload = {
        contents: [{
          parts: [
            { text: `Look at this photograph. 1. Generate a short, beautiful, professional fine-art gallery title (max 4 words). 2. Choose ONE of these exact subcategories that best fits it: [${CATEGORIES.join(', ')}]. Reply EXACTLY and ONLY in JSON format: {"title": "The Title", "subcategory": "The Subcategory"}` },
            { inline_data: { mime_type: "image/jpeg", data: base64 } }
          ]
        }]
      }

      const aiRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const aiData = await aiRes.json()
      
      if (!aiData.candidates || aiData.candidates.length === 0) {
         logs.push(`Gemini failed on ${art._id}: ${JSON.stringify(aiData)}`)
         continue
      }

      const text = aiData.candidates[0].content.parts[0].text
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim()
      
      try {
        const parsed = JSON.parse(cleanText)
        const newTitle = parsed.title || "Vistas Collection"
        const subCatName = parsed.subcategory || "Environment"
        
        const subCatRef = subcatMap[subCatName.toLowerCase()] || subcatMap['environment']

        // Patch Sanity
        await client.patch(art._id)
          .set({ 
            title: newTitle, 
            displayTitle: newTitle, 
            subcategory: { _type: 'reference', _ref: subCatRef } 
          })
          .commit()

        logs.push(`SUCCESS: ${art.displayTitle} -> ${newTitle} [${subCatName}]`)
        processed++
      } catch (e) {
        logs.push(`Parse error on ${art._id}: ${e.message} - Response: ${cleanText}`)
      }
    }

    return NextResponse.json({ processed, logs })

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}