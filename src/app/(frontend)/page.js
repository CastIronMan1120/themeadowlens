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
  
  // Default to Sanity CDN composite image if CMS isn't filled out yet
  const defaultHeroLogo = "https://cdn.sanity.io/images/h7ncr8cq/production/eeb19431e524e43391ed803793c9a8f076b20756-1376x768.jpg"
  const defaultSliderImage = "https://cdn.sanity.io/images/h7ncr8cq/production/eeb19431e524e43391ed803793c9a8f076b20756-1376x768.jpg"
  
  const heroImageUrl = homepage?.heroImageUrl || defaultHeroLogo
  const sliderImages = sliderArtworks.length > 0 ? sliderArtworks : [defaultSliderImage]
  const welcomeHeadline = homepage?.welcomeHeadline || "Welcome!"

  return (
    <main className="min-h-screen bg-black">
      
      {/* 1. THE WELCOME ENTRANCE */}
      <section className="relative w-full pt-1 sm:pt-1.5 md:pt-2 pb-5 sm:pb-7 px-4 sm:px-6 md:px-10 lg:px-14 max-w-[2100px] mx-auto">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6 items-start w-full">
          
          {/* Left Column: 100% Round Circular Lens in 16:9 Rectangular Panorama (Matched 50/50 Twin 16:9 Rectangle) */}
          <div className="w-full">
            <div className="w-full aspect-[16/9] relative rounded-xl overflow-hidden border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.85)] bg-neutral-950">
              <img 
                src={`${heroImageUrl}?w=1600&q=95&auto=format`} 
                alt="The Meadow Lens — Through the 600mm Lens" 
                className="w-full h-full object-contain select-none block"
              />
            </div>
          </div>

          {/* Right Column: Live Exhibition Slider with Overlay Welcome Card (Matched 50/50 Twin 16:9 Rectangle) */}
          <div className="w-full lg:aspect-[16/9] relative overflow-hidden rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex flex-col md:block bg-neutral-950 border border-white/15">
            <div className="relative w-full aspect-[16/9] md:aspect-auto md:absolute md:inset-0">
              <HeroSlider images={sliderImages} />
            </div>
            
            {/* Welcome Card: Below slider on smartphones so photos are 100% visible; Top-Right overlay on md+ */}
            <div className="relative md:absolute md:top-0 md:right-0 w-full md:w-[70%] lg:w-[68%] xl:w-[64%] max-h-full overflow-y-auto bg-neutral-950/95 md:bg-slate-950/75 md:backdrop-blur-md p-5 sm:p-6 md:p-6 xl:p-7 border-t md:border-t-0 md:border-l md:border-b border-white/15 z-20 md:rounded-bl-2xl shadow-2xl">
              <h2 className="text-xl sm:text-2xl xl:text-3xl text-white mb-2 sm:mb-3 font-light tracking-wide">{welcomeHeadline}</h2>
              
              <div className="space-y-2 sm:space-y-2.5 text-neutral-100 text-xs sm:text-[13.5px] xl:text-sm leading-relaxed font-light">
                {homepage?.welcomeText ? (
                  <PortableText value={homepage.welcomeText} />
                ) : (
                  <>
                    <p>Hello! I&apos;m photographer and Northern NJ native David McClure.</p>
                    <p>
                      Thank you for visiting my gallery, where I showcase the allure of nature&apos;s living creatures...
                    </p>
                    <p>
                      This gallery is chock-full of those beautiful birds and nature&apos;s surrounding flora and other fauna...
                    </p>
                    <p className="italic pt-2 text-white">
                      After all, this is &ldquo;The Meadowlands&rdquo;, and I&apos;m &ldquo;The Meadow LENS&rdquo;! ... get it?
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
        <div className="w-full bg-neutral-950 border-t border-b border-neutral-800 pt-5 sm:pt-7 pb-3 sm:pb-4 text-center relative z-30">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-light text-white tracking-[0.25em] sm:tracking-[0.3em] uppercase text-xs sm:text-sm">Featured Works</h2>
          <div className="w-12 h-[1px] bg-emerald-600 mx-auto mt-2 mb-4"></div>
          <FeaturedTicker artworks={homepage.featuredPhotos} speed={homepage?.featuredTickerSpeed || 60} />
        </div>
      )}

      {/* 3. VENUES TILE GRID */}
      <section id="venues" className="py-6 sm:py-8 px-4 sm:px-6 md:px-10 lg:px-14 max-w-[2100px] mx-auto bg-neutral-950 relative z-20">
        
        <div className="max-w-4xl mx-auto text-center mb-5 sm:mb-7 mt-1 sm:mt-2 px-2">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-white mb-1.5 sm:mb-2 tracking-wide">Explore The Venues</h2>
          <p className="text-neutral-400 font-light text-sm sm:text-base md:text-lg">
            Step into our digital halls. Select a venue below to explore the collection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent opacity-90 group-hover:opacity-75 transition-opacity duration-500" />
                <div className="absolute inset-0 flex flex-col items-center justify-end p-4 sm:p-5 md:p-6 pb-4 sm:pb-5 md:pb-6 text-center">
                  {isGuestVenue && (
                    <span className="mb-2 px-3 py-0.5 bg-black/75 border border-emerald-500/40 text-emerald-400 font-mono text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.25em]">
                      Curated By Invitation
                    </span>
                  )}
                  <h3 className="text-lg sm:text-xl md:text-2xl text-white font-semibold tracking-wider sm:tracking-widest uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)] leading-snug group-hover:scale-[1.03] transition-transform duration-500">
                    {venue.title}
                  </h3>
                </div>
              </Link>
            )
          })}
        </div>

        {/* 4. INTERNAL PAGES & CURATED DIRECTORY STRIP */}
        <div className="mt-10 sm:mt-14 pt-8 sm:pt-10 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Link
            href="/category/guest-photos"
            className="group p-6 sm:p-8 bg-neutral-900/60 border border-emerald-500/20 hover:border-emerald-500/50 transition-all duration-300 flex flex-col justify-between"
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















