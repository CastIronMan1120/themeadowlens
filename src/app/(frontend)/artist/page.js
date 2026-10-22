import Link from 'next/link'
import { client } from '../../../sanity/lib/client'
import { urlForImage } from '../../../sanity/lib/image'
import { PortableText } from '@portabletext/react'

export const revalidate = 0

export const metadata = {
  title: 'The Artist | The Meadow Lens',
  description: 'Learn more about photographer and Northern NJ native David McClure.',
  keywords: ["David McClure", "Photographer", "Biography", "Fine Art", "The Meadowlands", "Nature Photographer", "NJ Native"],
  openGraph: {
    title: 'The Artist | The Meadow Lens',
    description: 'Learn more about photographer and Northern NJ native David McClure.',
    type: 'profile',
  }
}

export default async function ArtistPage() {
  const query = `*[_type == "artist"][0]`
  const artist = await client.fetch(query)
  const hp = await client.fetch(`*[_type == "homepage"][0]{"heroImageUrl": heroImage.asset->url}`)

  // Fallback to the Meadow Lens composite graphic if no personal portrait is uploaded yet
  const defaultLensImage = "https://d15yhgn2ui21mw.cloudfront.net/production/27828/MDAwMDAwMDAwMDAw7QGraePd6CACehR_ZcfBFYwXu2FyveAYEUnRGwCTQQQLtneRwWETeR6yOMFIOjy24aDow_LJj7F22f2vd2S3k0FN_38EZqodfTc2xEuhDJufAHDziomoKXOdJ3Hs_jG_Da6jI5Eudq_OlWAGPJ5eMn5GdWubauzcA36GcgRY1fWMRXAyI_kns64GDLOzMbtDhp4MzfALcUQj-6GhUPrzz2cP26jvMuXkEAQK9UuhPaFh6sZ0WiHUxvwkfo0iBUIvrtzbVMJOQCKJtixHhM2uAFAzJqp3tkw9CK1Q-UUQdYf17tBc8FtuRPZjA0HS8f5UQNMgYWf3w4K_o-rz34O8o0_KFsf5lFPtzMsdvKDrF20U_Yv9QZ62UCQwOpCzcYBMuUz2OSK6lNEue5NbDJrMm6IGoPAHiyZ5_g61_8NiomtEwYlgpUDMZK8TyFQcauOrq_vNZrrN3XuD-pTFsS_tRZSwoQhWGDTxkzfRjWOFZqNs5sSydA.jpg"
  const name = artist?.name || "David McClure"
  const tagline = artist?.tagline || 'After all, this is "The Meadowlands", and I\'m "The Meadow LENS"! ... get it?'
  const imageUrl = artist?.portrait ? urlForImage(artist.portrait).width(1200).url() : (hp?.heroImageUrl || defaultLensImage)

  return (
    <main className="min-h-screen bg-black">
      <section className="relative w-full min-h-screen pt-32 sm:pt-40 md:pt-[240px] pb-16 px-4 sm:px-6 md:px-12 lg:px-24 max-w-[2000px] mx-auto flex items-center">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16 lg:gap-24 items-center w-full">
          
          {/* Left Column: Portrait */}
          <div className="w-full max-w-md lg:max-w-none mx-auto aspect-square relative overflow-hidden rounded-md shadow-[0_20px_50px_rgba(255,255,255,0.05)] border border-neutral-900">
            <img 
              src={imageUrl} 
              alt={name} 
              className="absolute inset-0 w-full h-full object-cover transition-all duration-[2s]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
          </div>

          {/* Right Column: Bio */}
          <div className="flex flex-col space-y-6 sm:space-y-8">
            <h1 className="text-4xl sm:text-6xl md:text-8xl text-white font-light tracking-tight mb-2 sm:mb-4">
              The Artist
            </h1>
            
            <div className="space-y-5 sm:space-y-6 text-neutral-300 text-base sm:text-lg md:text-xl font-light leading-relaxed prose prose-invert prose-p:text-neutral-300">
              {artist?.bio ? (
                <PortableText value={artist.bio} />
              ) : (
                <>
                  <p>Hello! I&apos;m photographer and Northern NJ native David McClure.</p>
                  <p>Thank you for visiting my gallery, where I showcase the allure of nature&apos;s living creatures, with special emphasis on birds, as well as captivating NYC skyline views, sunsets, aircraft, trains and anything else that is photo-worthy, captured almost exclusively in and around the marshes, creeks, forests, environmental parks, protected lands, and former landfills of the NJ Meadowlands.</p>
                  <p>In NJ lingo, it&apos;s not uncommon for someone to ask, &ldquo;what&apos;s your exit?&rdquo;, meaning &ldquo;what NJ Turnpike exit do you live off of?&rdquo;. My answer to this question would surely be that I live off of Exit 16W of the Atlantic Flyway!</p>
                  <p>The Atlantic Flyway is the major migratory route for birds traveling up and down the eastern seaboard of the United States, shadowing Interstate 95, which, in NJ, is known as the NJ Turnpike. This gallery is chock-full of those beautiful birds and nature&apos;s surrounding flora and other fauna that they co-exist with. I hope you enjoy the pictures and my occasional narratives on this unique region.</p>
                </>
              )}
              
              <p className="italic text-white pt-3 sm:pt-4 text-xl sm:text-2xl font-serif">
                {tagline}
              </p>
            </div>

            <div className="pt-6 sm:pt-12">
              <Link href="?inquire=true" scroll={false} className="inline-block w-full sm:w-auto text-center border border-white text-white px-8 py-4 uppercase tracking-[0.2em] text-xs sm:text-sm hover:bg-white hover:text-black transition-colors">
                Private Inquiry
              </Link>
            </div>
          </div>

        </div>
      </section>
    </main>
  )
}
