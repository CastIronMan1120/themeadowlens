import { client } from '../../sanity/lib/client'
import Link from 'next/link'
import FeaturedTicker from '../components/FeaturedTicker'
import { PortableText } from '@portabletext/react'

export const revalidate = 0 

function hexToRgba(hex, opacityPercent = 75) {
  const cleanHex = String(hex || '#0B1528').replace('#', '').trim()
  let r = 11, g = 21, b = 40
  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16)
    g = parseInt(cleanHex[1] + cleanHex[1], 16)
    b = parseInt(cleanHex[2] + cleanHex[2], 16)
  } else if (cleanHex.length === 6) {
    r = parseInt(cleanHex.slice(0, 2), 16)
    g = parseInt(cleanHex.slice(2, 4), 16)
    b = parseInt(cleanHex.slice(4, 6), 16)
  }
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    r = 11; g = 21; b = 40
  }
  const clampedOpacity = Math.max(0, Math.min(100, Number(opacityPercent ?? 75)))
  const alpha = Number((clampedOpacity / 100).toFixed(3))
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export default async function Home() {
  const query = `*[_type == "category" && !defined(parentCategory) && !(title in ["Everything"])] {
    _id,
    title,
    slug,
    sortOrder,
    "imageUrl": coalesce(menuImage.asset->url, *[_type == "artwork" && (category._ref == ^._id || category->parentCategory._ref == ^._id) && defined(image.asset)][0].image.asset->url)
  }`
  const rawVenues = await client.fetch(query)
  const venues = [...(rawVenues || [])].sort((a, b) => {
    const orderA = typeof a.sortOrder === 'number' && !Number.isNaN(a.sortOrder) ? a.sortOrder : 9999
    const orderB = typeof b.sortOrder === 'number' && !Number.isNaN(b.sortOrder) ? b.sortOrder : 9999
    if (orderA !== orderB) return orderA - orderB
    return (a.title || '').localeCompare(b.title || '', undefined, { numeric: true, sensitivity: 'base' })
  })

  // 1. Fetch Homepage Settings (Left & Right Static Panels + Customizable Welcome Overlay)
  const homepage = await client.fetch(`*[_type == "homepage"][0] {
    welcomeHeadline,
    welcomeText,
    quote,
    featuredTickerSpeed,
    showWelcomeOverlay,
    rightPanelFit,
    welcomeBgColor,
    welcomeBgOpacity,
    welcomeTextColor,
    welcomeBackdropBlur,
    "featuredPhotos": featuredArtworks[]->{_id, title, slug, "url": image.asset->url, "imageUrl": image.asset->url},
    "heroImageUrl": heroImage.asset->url,
    "rightPanelImageUrl": rightPanelImage.asset->url
  }`)
  
  // Default Left & Right Static Images if CMS isn't filled out yet
  const defaultHeroLogo = "https://cdn.sanity.io/images/h7ncr8cq/production/eeb19431e524e43391ed803793c9a8f076b20756-1376x768.jpg"
  const defaultRightStaticImage = "https://cdn.sanity.io/images/h7ncr8cq/production/5605871a7f1ecad1d40489e4b594c093c0c8bdbe-4756x3567.jpg"
  
  const heroImageUrl = homepage?.heroImageUrl || defaultHeroLogo
  const rightPanelStaticUrl =
    homepage?.rightPanelImageUrl ||
    homepage?.featuredPhotos?.[0]?.url ||
    defaultRightStaticImage
  const rightPanelFit = homepage?.rightPanelFit === 'contain' ? 'object-contain' : 'object-cover'
  const showWelcomeOverlay = homepage?.showWelcomeOverlay !== false
  const welcomeHeadline = homepage?.welcomeHeadline || "Welcome to The Meadow Lens"
  const welcomeBgColor = homepage?.welcomeBgColor || '#0B1528'
  const welcomeBgOpacity =
    typeof homepage?.welcomeBgOpacity === 'number' && !Number.isNaN(homepage.welcomeBgOpacity)
      ? Math.max(0, Math.min(100, homepage.welcomeBgOpacity))
      : 75
  const welcomeTextColor = homepage?.welcomeTextColor || '#F8FAFC'
  const welcomeBackdropBlur = homepage?.welcomeBackdropBlur !== false && welcomeBgOpacity > 0
  const welcomeOverlayBgRgba = hexToRgba(welcomeBgColor, welcomeBgOpacity)

  return (
    <main className="min-h-screen bg-black">
      
      {/* 1. THE WELCOME ENTRANCE (Twin 50/50 16:9 Static Panels + Optional Customizable Welcome Overlay) */}
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

          {/* Right Column: Static Photograph with Optional Customizable Welcome Content Overlay (Matched 50/50 Twin 16:9 Rectangle) */}
          <div className="w-full lg:aspect-[16/9] relative overflow-hidden rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex flex-col md:block bg-neutral-950 border border-white/15">
            <div className="relative w-full aspect-[16/9] md:aspect-auto md:absolute md:inset-0 bg-neutral-950">
              <img
                src={`${rightPanelStaticUrl}?w=1600&q=95&auto=format`}
                alt="Featured Photography by David McClure — The Meadow Lens"
                className={`w-full h-full ${rightPanelFit} object-center select-none block`}
              />
            </div>
            
            {/* Welcome Card: Centered both horizontally & vertically inside the Right Panel 16:9 image */}
            {showWelcomeOverlay && (
              <div className="relative md:absolute md:inset-0 md:flex md:items-center md:justify-center md:p-3.5 lg:p-4 xl:p-5 z-20 pointer-events-none">
                <div
                  style={{
                    backgroundColor: welcomeOverlayBgRgba,
                    color: welcomeTextColor,
                  }}
                  className={`pointer-events-auto w-full md:w-[88%] lg:w-[86%] xl:w-[84%] max-h-full overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden p-4 sm:p-5 md:px-6 md:py-4 xl:px-7 xl:py-5 md:rounded-2xl text-center transition-colors duration-300 ${
                    welcomeBackdropBlur ? 'md:backdrop-blur-md' : ''
                  } ${
                    welcomeBgOpacity > 5
                      ? 'border-t md:border border-white/15 shadow-[0_18px_45px_rgba(0,0,0,0.65)]'
                      : ''
                  }`}
                >
                  <h2
                    style={{ color: welcomeTextColor }}
                    className="text-lg sm:text-xl lg:text-[22px] xl:text-2xl mb-1.5 sm:mb-2 font-light tracking-wide text-center"
                  >
                    {welcomeHeadline}
                  </h2>
                  
                  <div
                    style={{ color: welcomeTextColor }}
                    className="space-y-1.5 sm:space-y-2 text-xs sm:text-[12.5px] xl:text-[13.5px] leading-snug sm:leading-relaxed font-light opacity-95 text-center"
                  >
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
                        <p className="italic pt-1">
                          After all, this is &ldquo;The Meadowlands&rdquo;, and I&apos;m &ldquo;The Meadow LENS&rdquo;! ... get it?
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
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















