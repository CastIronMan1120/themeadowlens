import Link from 'next/link'
import { client } from '../../sanity/lib/client'
import { urlForImage } from '../../sanity/lib/image'
import { PortableText } from '@portabletext/react'

export const revalidate = 0

export const metadata = {
  title: 'The Artist | The Meadow Lens',
  description: 'Learn more about photographer and Northern NJ native David McClure.',
}

export default async function ArtistPage() {
  const query = `*[_type == "artist"][0]`
  const artist = await client.fetch(query)

  // Fallback in case they haven't created the profile yet
  const name = artist?.name || "David McClure"
  const tagline = artist?.tagline || 'After all, this is "The Meadowlands", and I\'m "The Meadow LENS"! ... get it?'
  const imageUrl = artist?.portrait ? urlForImage(artist.portrait).width(1200).url() : "https://images.unsplash.com/photo-1551804910-72138e4a9082?q=80&w=1200&auto=format&fit=crop"

  return (
    <main className="min-h-screen bg-black">
      <section className="relative w-full min-h-screen pt-32 pb-16 px-6 md:px-12 lg:px-24 max-w-[2000px] mx-auto flex items-center">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center w-full">
          
          {/* Left Column: Portrait */}
          <div className="w-full aspect-[3/4] relative overflow-hidden rounded-md shadow-[0_20px_50px_rgba(255,255,255,0.05)] border border-neutral-900">
            <img 
              src={imageUrl} 
              alt={name} 
              className="absolute inset-0 w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-[2s]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
          </div>

          {/* Right Column: Bio */}
          <div className="flex flex-col space-y-8">
            <h1 className="text-6xl md:text-8xl text-white font-light tracking-tight mb-4">
              The Artist
            </h1>
            
            <div className="space-y-6 text-neutral-300 text-lg md:text-xl font-light leading-relaxed prose prose-invert prose-p:text-neutral-300">
              {artist?.bio ? (
                <PortableText value={artist.bio} />
              ) : (
                <>
                  <p>Hello! I'm photographer and Northern NJ native David McClure.</p>
                  <p>Thank you for visiting my gallery, where I showcase the allure of nature's living creatures, with special emphasis on birds, as well as captivating NYC skyline views, sunsets, aircraft, trains and anything else that is photo-worthy, captured almost exclusively in and around the marshes, creeks, forests, environmental parks, protected lands, and former landfills of the NJ Meadowlands.</p>
                  <p>In NJ lingo, it's not uncommon for someone to ask, "what's your exit?", meaning "what NJ Turnpike exit do you live off of?". My answer to this question would surely be that I live off of Exit 16W of the Atlantic Flyway!</p>
                  <p>The Atlantic Flyway is the major migratory route for birds traveling up and down the eastern seaboard of the United States, shadowing Interstate 95, which, in NJ, is known as the NJ Turnpike. This gallery is chock-full of those beautiful birds and nature's surrounding flora and other fauna that they co-exist with. I hope you enjoy the pictures and my occasional narratives on this unique region.</p>
                </>
              )}
              
              <p className="italic text-white pt-4 text-2xl font-serif">
                {tagline}
              </p>
            </div>

            <div className="pt-12">
              <a href="mailto:dmc1120@themeadowlens.com" className="inline-block border border-white text-white px-8 py-4 uppercase tracking-[0.2em] text-sm hover:bg-white hover:text-black transition-colors">
                Private Inquiry
              </a>
            </div>
          </div>

        </div>
      </section>
    </main>
  )
}
