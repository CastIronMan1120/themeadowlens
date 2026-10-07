import { NextResponse } from 'next/server';
import { client } from '../../../sanity/lib/client';

export const maxDuration = 60; // Allow 60s for Vercel

export async function GET(req) {
  try {
    const artworks = await client.fetch(`*[_type == "artwork" && defined(fileName)][0...500] { _id, fileName, title, displayTitle }`);
    
    let processed = 0;
    const logs = [];

    const writeClient = client.withConfig({
      token: process.env.SANITY_TOKEN,
      useCdn: false
    });

    for (const art of artworks) {
      const match = art.fileName.match(/^(.+?)\s+\d{2}-/);
      
      if (match && match[1]) {
        const cleanTitle = match[1].trim();
        
        if (art.title !== cleanTitle || art.displayTitle !== cleanTitle) {
          logs.push(`Updating ${art.fileName} -> "${cleanTitle}"`);
          await writeClient.patch(art._id)
            .set({ 
              title: cleanTitle,
              displayTitle: cleanTitle
            })
            .commit();
          processed++;
        }
      }
    }

    return NextResponse.json({ success: true, processed, logs });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
