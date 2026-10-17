import { client } from '../../sanity/lib/client'
import Link from 'next/link'
import HeroSlider from '../components/HeroSlider'
import FeaturedTicker from '../components/FeaturedTicker'
import { PortableText } from '@portabletext/react'

export const revalidate = 0 

export default async function Home() {
  const query = `*[_type == "category" && !defined(parentCategory) && !(title in ["Everything"])] | order(title asc) {
    _id,
    title,
    slug,
    "imageUrl": coalesce(menuImage.asset->url, *[_type == "artwork" && (category._ref == ^._id || category->parentCategory._ref == ^._id) && defined(image.asset)][0].image.asset->url)
  }`
  const venues = await client.fetch(query)

  // 1. Fetch Homepage Settings
  const homepage = await client.fetch(`*[_type == "homepage"][0] {
    welcomeHeadline,
    welcomeText,
    quote,
    featuredTickerSpeed,
    "featuredPhotos": featuredArtworks[]->{_id, title, slug, "url": image.asset->url, "imageUrl": image.asset->url},
    "heroImageUrl": heroImage.asset->url
  }`)

  // 2. Fetch Hero Slider Photos (Most recently added)
  const sliderQuery = `*[_type == "artwork" && defined(image.asset)] | order(_createdAt desc)[0...15] { 
    _id, title, slug, "url": image.asset->url, "imageUrl": image.asset->url 
  }`
  const sliderArtworks = await client.fetch(sliderQuery)
  
  // Default to original images if CMS isn't filled out yet
  const defaultHeroLogo = "https://d15yhgn2ui21mw.cloudfront.net/production/27828/MDAwMDAwMDAwMDAw7QGraePd6CACehR_ZcfBFYwXu2FyveAYEUnRGwCTQQQLtneRwWETeR6yOMFIOjy24aDow_LJj7F22f2vd2S3k0FN_38EZqodfTc2xEuhDJufAHDziomoKXOdJ3Hs_jG_Da6jI5Eudq_OlWAGPJ5eMn5GdWubauzcA36GcgRY1fWMRXAyI_kns64GDLOzMbtDhp4MzfALcUQj-6GhUPrzz2cP26jvMuXkEAQK9UuhPaFh6sZ0WiHUxvwkfo0iBUIvrtzbVMJOQCKJtixHhM2uAFAzJqp3tkw9CK1Q-UUQdYf17tBc8FtuRPZjA0HS8f5UQNMgYWf3w4K_o-rz34O8o0_KFsf5lFPtzMsdvKDrF20U_Yv9QZ62UCQwOpCzcYBMuUz2OSK6lNEue5NbDJrMm6IGoPAHiyZ5_g61_8NiomtEwYlgpUDMZK8TyFQcauOrq_vNZrrN3XuD-pTFsS_tRZSwoQhWGDTxkzfRjWOFZqNs5sSydA.jpg"
  const defaultSliderImage = "https://d15yhgn2ui21mw.cloudfront.net/production/27828/MDAwMDAwMDAwMDAw7QGraePd6CACehR_ZcfBFYwXu2FyveAYEUnRGwCTQQQLtneRwWETeR6yOMFIOjy24aDow_LJj7F22f2vd2S3k0FN_38EZqodfTc2xEuhDJufAHDziomoKXOdJ3Hs_jG_Da6jI5Eudq_OlWAGPJ5eMn5SVizHNoqjVGKBfhUP58mXRnMzJf0jqt1SUen0BLgI3pE92_gRXVg-6LuoU7ytliAZ0MakIbKhUR5YqEvrdqExp4pvWSfBw-lyLdR8Rkw3gs6dRsUeF3XNpGs4k8D_awBPQVsnmE08y6oKQQw.jpg"
  
  const heroImageUrl = homepage?.heroImageUrl || defaultHeroLogo
  const sliderImages = sliderArtworks.length > 0 ? sliderArtworks : [defaultSliderImage]
  const welcomeHeadline = homepage?.welcomeHeadline || "Welcome!"

  return (
    <main className="min-h-screen bg-black">
      
      {/* 1. THE WELCOME ENTRANCE */}
      <section className="relative w-full pt-48 pb-16 px-6 md:px-12 lg:px-24 max-w-[2400px] mx-auto flex items-center">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-12 items-stretch w-full">
          
          {/* Left Column: Branding & Lens */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="w-full max-w-lg mt-8 shadow-2xl relative aspect-square bg-transparent">
              <img 
                src={heroImageUrl} 
                alt="The Meadow Lens Composite" 
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right Column: Slider with Overlay Text */}
          <div className="w-full relative overflow-hidden rounded-md shadow-2xl min-h-[600px] flex">
            <HeroSlider images={sliderImages} />
            
            {/* Overlay Text Top Right */}
            <div className="absolute top-0 right-0 w-full md:w-3/4 lg:w-4/5 xl:w-2/3 bg-black/60 backdrop-blur-md p-8 sm:p-10 border-l border-b border-neutral-800 z-20 rounded-bl-3xl">
              <h2 className="text-4xl text-white mb-6 font-light">{welcomeHeadline}</h2>
              
              <div className="space-y-4 text-neutral-200 text-sm md:text-base leading-relaxed">
                {homepage?.welcomeText ? (
                  <PortableText value={homepage.welcomeText} />
                ) : (
                  <>
                    <p>Hello! I'm photographer and Northern NJ native David McClure.</p>
                    <p>
                      Thank you for visiting my gallery, where I showcase the allure of nature's living creatures...
                    </p>
                    <p>
                      This gallery is chock-full of those beautiful birds and nature's surrounding flora and other fauna...
                    </p>
                    <p className="italic pt-2 text-white">
                      After all, this is "The Meadowlands", and I'm "The Meadow LENS"! ... get it?
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. FEATURED TICKER */}
      {homepage?.featuredPhotos && homepage.featuredPhotos.length > 0 && (
        <div className="w-full bg-neutral-950 border-t border-b border-neutral-800 pt-16 pb-6 text-center relative z-30">
          <h2 className="text-2xl md:text-3xl font-light text-white tracking-[0.3em] uppercase text-sm">Featured Works</h2>
          <div className="w-12 h-[1px] bg-emerald-600 mx-auto mt-4 mb-8"></div>
          <FeaturedTicker artworks={homepage.featuredPhotos} speed={homepage?.featuredTickerSpeed || 60} />
        </div>
      )}

      {/* 3. VENUES TILE GRID */}
      <section id="venues" className="min-h-screen p-4 sm:p-8 md:p-16 max-w-[2400px] mx-auto bg-neutral-950 relative z-20">
        
        <div className="max-w-4xl mx-auto text-center mb-16 mt-12">
          <h2 className="text-3xl md:text-4xl font-light text-white mb-6 tracking-wide">Explore The Venues</h2>
          <p className="text-neutral-400 font-light text-lg">
            Step into our digital halls. Select a venue below to explore the collection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {venues.map((venue) => {
            const isGuestVenue = venue.slug?.current === 'guest-photos'
            return (
              <Link 
                href={`/category/${venue.slug.current}`} 
                key={venue._id}
                className={`group relative aspect-[4/3] overflow-hidden bg-neutral-900 block border ${
                  isGuestVenue ? 'border-emerald-500/30 hover:border-emerald-400/60' : 'border-white/5 hover:border-white/20'
                } transition-colors duration-500`}
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
                  style={{ backgroundImage: `url('${venue.imageUrl || heroImageUrl}')` }}
                />
                <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors duration-500" />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <h3 className="text-3xl md:text-4xl text-white font-light tracking-widest uppercase drop-shadow-2xl shadow-black group-hover:scale-110 transition-transform duration-500">
                    {venue.title}
                  </h3>
                  {isGuestVenue && (
                    <span className="mt-3 px-3 py-1 bg-black/70 border border-emerald-500/40 text-emerald-400 font-mono text-[10px] uppercase tracking-[0.25em]">
                      Curated By Invitation
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>

        {/* 4. INTERNAL PAGES & CURATED DIRECTORY STRIP */}
        <div className="mt-24 pt-16 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            href="/category/guest-photos"
            className="group p-8 bg-neutral-900/60 border border-emerald-500/20 hover:border-emerald-500/50 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-emerald-400 block mb-2">
                By Invitation Only
              </span>
              <h3 className="text-xl text-white font-light tracking-wider uppercase mb-2 group-hover:text-emerald-300 transition-colors">
                Guest Photos
              </h3>
              <p className="text-neutral-400 text-xs leading-relaxed font-light">
                Exceptional wildlife & nature photography captured by invited guest artists.
              </p>
            </div>
            <span className="mt-6 text-[10px] font-mono uppercase tracking-widest text-white/60 group-hover:text-white">
              Enter Showcase &rarr;
            </span>
          </Link>

          <Link
            href="/bird-index"
            className="group p-8 bg-neutral-900/60 border border-white/10 hover:border-white/30 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-500 block mb-2">
                A–Z Field Guide
              </span>
              <h3 className="text-xl text-white font-light tracking-wider uppercase mb-2">
                Species Index
              </h3>
              <p className="text-neutral-400 text-xs leading-relaxed font-light">
                Browse the complete alphabetical catalog of birds, mammals, flora, and fauna.
              </p>
            </div>
            <span className="mt-6 text-[10px] font-mono uppercase tracking-widest text-white/60 group-hover:text-white">
              Browse Species &rarr;
            </span>
          </Link>

          <Link
            href="/artist"
            className="group p-8 bg-neutral-900/60 border border-white/10 hover:border-white/30 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-500 block mb-2">
                Behind The Lens
              </span>
              <h3 className="text-xl text-white font-light tracking-wider uppercase mb-2">
                The Artist
              </h3>
              <p className="text-neutral-400 text-xs leading-relaxed font-light">
                Meet Northern NJ native David McClure and explore the story of The Meadow Lens.
              </p>
            </div>
            <span className="mt-6 text-[10px] font-mono uppercase tracking-widest text-white/60 group-hover:text-white">
              Read Biography &rarr;
            </span>
          </Link>

          <Link
            href="/news"
            className="group p-8 bg-neutral-900/60 border border-white/10 hover:border-white/30 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-500 block mb-2">
                Gallery Dispatches
              </span>
              <h3 className="text-xl text-white font-light tracking-wider uppercase mb-2">
                What&apos;s New
              </h3>
              <p className="text-neutral-400 text-xs leading-relaxed font-light">
                Latest field updates, newly cataloged collections, and exhibition announcements.
              </p>
            </div>
            <span className="mt-6 text-[10px] font-mono uppercase tracking-widest text-white/60 group-hover:text-white">
              View Dispatches &rarr;
            </span>
          </Link>
        </div>
      </section>
      
    </main>
  )
}















