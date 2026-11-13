import { Suspense } from 'react'
import { client } from '../../../../sanity/lib/client'
import { urlForImage } from '../../../../sanity/lib/image'
import { PortableText } from '@portabletext/react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ArtworkOptions from '../../../components/ArtworkOptions'
import ImageZoom from '../../../components/ImageZoom'

export const revalidate = 0

function extractStudyCode(artwork) {
  const source = `${artwork?.fileName || ''} ${artwork?.title || ''} ${artwork?.slug?.current || ''}`
  const match = source.match(/(?:[A-Za-z0-9_-]*?)(\d{4,})(?:\b|[-_.]|Edit)/i)
  if (match && match[1]) {
    return match[1].slice(-4)
  }
  const cleanId = (artwork?._id || '').replace(/^drafts\./, '')
  return cleanId.slice(-4).toUpperCase() || '0001'
}

// Dynamic SEO Metadata Generation for Google Indexing & Social Sharing
export async function generateMetadata({ params }) {
  const { slug } = await params
  const artwork = await client.fetch(
    `*[_type == "artwork" && slug.current == $slug][0]{
      ...,
      "categoryTitle": category->title,
      "parentCategoryTitle": category->parentCategory->title
    }`,
    { slug }
  )

  if (!artwork) return {}

  const cleanTitle = (artwork.displayTitle || artwork.title || 'Fine Art Photograph').trim()
  const studyCode = extractStudyCode(artwork)
  const venueLabel = artwork.categoryTitle || artwork.parentCategoryTitle || 'The Meadowlands'
  const yearLabel = artwork.year ? `${artwork.year} ` : ''
  const locationLabel = artwork.location || 'The New Jersey Meadowlands (Exit 16W, Atlantic Flyway)'
  const imageUrl = artwork.image ? urlForImage(artwork.image).width(1200).height(630).url() : ''

  const dynamicKeywords = Array.from(
    new Set(
      [
        cleanTitle,
        `${cleanTitle} ${venueLabel}`,
        `${cleanTitle} Study ${studyCode}`,
        artwork.species && `${artwork.species} Photography`,
        artwork.species && `${artwork.species} Fine Art Print`,
        venueLabel,
        artwork.parentCategoryTitle,
        artwork.guestPhotographer,
        artwork.dominantColor,
        locationLabel,
        artwork.year && `${artwork.year} Wildlife Photography`,
        'The Meadowlands',
        'Atlantic Flyway',
        'David McClure Fine Art Photography',
        'The Meadow Lens',
      ].filter(Boolean)
    )
  )

  const defaultTitle = artwork.guestPhotographer
    ? `${cleanTitle} by Guest Artist ${artwork.guestPhotographer} (${venueLabel}, Study #${studyCode}) | The Meadow Lens`
    : `${cleanTitle} — ${venueLabel} (${yearLabel}Study #${studyCode}) | Fine Art Print | The Meadow Lens`

  const captionSnippet = artwork.caption ? ` ${artwork.caption.trim()}` : ''
  const defaultDesc = artwork.guestPhotographer
    ? artwork.guestNote ||
      `Featured Guest Photograph "${cleanTitle}" (Study #${studyCode}) by ${artwork.guestPhotographer}, curated by invitation in the ${venueLabel} exhibition on The Meadow Lens by David McClure.`
    : `Collector fine art photograph "${cleanTitle}" (${yearLabel}${venueLabel} Exhibition, Study #${studyCode}) captured in ${locationLabel} by David McClure.${captionSnippet} Available for private inquiry and interactive room preview.`

  const metaTitle = artwork.seo?.metaTitle || defaultTitle
  const metaDesc = artwork.seo?.metaDescription || defaultDesc
  const keywords = artwork.seo?.keywords?.length > 0 ? artwork.seo.keywords : dynamicKeywords
  const canonicalPath = `/art/${slug}`

  return {
    title: metaTitle,
    description: metaDesc,
    keywords: keywords,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: metaTitle,
      description: metaDesc,
      url: canonicalPath,
      images: imageUrl ? [{ url: imageUrl, alt: cleanTitle }] : [],
      type: 'website',
    },
  }
}

export default async function ArtworkPage({ params }) {
  const { slug } = await params

  const artwork = await client.fetch(`*[_type == "artwork" && slug.current == $slug][0]{
    ...,
    "categorySlug": category->slug.current,
    "categoryTitle": category->title,
    "categoryAlphabetize": category->alphabetizeBySpecies,
    "parentCategorySlug": category->parentCategory->slug.current,
    "parentCategoryTitle": category->parentCategory->title
  }`, { slug })

  if (!artwork) {
    notFound()
  }

  const cleanTitle = artwork.displayTitle || artwork.title

  // Next / Previous Navigation within the same Category (respecting Alphabetical Species Order when enabled)
  const categoryId = artwork.category?._ref
  let prevArt = null
  let nextArt = null

  if (categoryId) {
    if (artwork.categoryAlphabetize) {
      const siblingArts = await client.fetch(
        `*[_type == "artwork" && !(_id in path("drafts.**")) && category._ref == $categoryId && defined(slug.current)]{
          _id,
          "slug": slug.current,
          species,
          displayTitle,
          title,
          fileName
        }`,
        { categoryId }
      )
      const sortedSiblings = [...siblingArts].sort((a, b) => {
        const speciesA = (a.species || a.displayTitle || a.title || '').trim()
        const speciesB = (b.species || b.displayTitle || b.title || '').trim()
        const cmp = speciesA.localeCompare(speciesB, undefined, { numeric: true, sensitivity: 'base' })
        if (cmp !== 0) return cmp
        const titleA = (a.displayTitle || a.title || '').trim()
        const titleB = (b.displayTitle || b.title || '').trim()
        const titleCmp = titleA.localeCompare(titleB, undefined, { numeric: true, sensitivity: 'base' })
        if (titleCmp !== 0) return titleCmp
        return (a.fileName || '').localeCompare(b.fileName || '', undefined, { numeric: true, sensitivity: 'base' })
      })
      const currentIdx = sortedSiblings.findIndex((item) => item.slug === slug || item._id === artwork._id)
      if (currentIdx > 0) {
        prevArt = { slug: sortedSiblings[currentIdx - 1].slug }
      }
      if (currentIdx >= 0 && currentIdx < sortedSiblings.length - 1) {
        nextArt = { slug: sortedSiblings[currentIdx + 1].slug }
      }
    } else {
      prevArt = await client.fetch(`*[_type == "artwork" && category._ref == $categoryId && _createdAt > $createdAt && defined(slug.current)] | order(_createdAt asc)[0] { "slug": slug.current }`, { categoryId, createdAt: artwork._createdAt })
      nextArt = await client.fetch(`*[_type == "artwork" && category._ref == $categoryId && _createdAt < $createdAt && defined(slug.current)] | order(_createdAt desc)[0] { "slug": slug.current }`, { categoryId, createdAt: artwork._createdAt })
    }
  }

  // Inquiry Link
  const inquiryLink = `?inquire=true&interest=${encodeURIComponent(cleanTitle)}`

  // Status Logic
  const status = artwork.status || 'available'
  const isAvailable = status === 'available'
  const isReserved = status === 'reserved'
  const isAcquired = status === 'acquired'

  // Social Share URLs
  const canonicalUrl = `https://themeadowlens.com/art/${slug}`
  const pageUrl = encodeURIComponent(canonicalUrl)
  const fullImageUrl = artwork.image ? urlForImage(artwork.image).width(2000).quality(90).auto('format').url() : ''
  const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`
  const xShareUrl = `https://twitter.com/intent/tweet?url=${pageUrl}&text=${encodeURIComponent(artwork.guestPhotographer ? `Featured Guest Photo by ${artwork.guestPhotographer} on The Meadow Lens:` : 'Experience this stunning piece by The Meadow Lens:')}`
  const pinterestShareUrl = `https://pinterest.com/pin/create/button/?url=${pageUrl}&media=${encodeURIComponent(fullImageUrl)}&description=${encodeURIComponent(cleanTitle)}`

  const studyCode = extractStudyCode(artwork)
  const venueLabel = artwork.categoryTitle || artwork.parentCategoryTitle || 'The Meadowlands'
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'VisualArtwork',
      name: `${cleanTitle} (Study #${studyCode})`,
      alternateName: cleanTitle,
      artMedium: 'Fine Art Photography',
      artform: 'Photograph',
      url: canonicalUrl,
      image: fullImageUrl || undefined,
      description:
        artwork.seo?.metaDescription ||
        artwork.caption ||
        `Collector fine art wildlife and nature photograph "${cleanTitle}" (${venueLabel}, Study #${studyCode}) by ${artwork.guestPhotographer || 'David McClure'}.`,
      creator: {
        '@type': 'Person',
        name: artwork.guestPhotographer || 'David McClure',
      },
      copyrightHolder: {
        '@type': 'Person',
        name: artwork.guestPhotographer || 'David McClure',
      },
      ...(artwork.year ? { dateCreated: String(artwork.year) } : {}),
      ...(artwork.location ? { contentLocation: { '@type': 'Place', name: artwork.location } } : {}),
      ...(artwork.species ? { about: { '@type': 'Thing', name: artwork.species } } : {}),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://themeadowlens.com/',
        },
        ...(artwork.parentCategorySlug
          ? [
              {
                '@type': 'ListItem',
                position: 2,
                name: artwork.parentCategoryTitle,
                item: `https://themeadowlens.com/category/${artwork.parentCategorySlug}`,
              },
            ]
          : []),
        ...(artwork.categorySlug
          ? [
              {
                '@type': 'ListItem',
                position: artwork.parentCategorySlug ? 3 : 2,
                name: artwork.categoryTitle,
                item: artwork.parentCategorySlug
                  ? `https://themeadowlens.com/category/${artwork.parentCategorySlug}/${artwork.categorySlug}`
                  : `https://themeadowlens.com/category/${artwork.categorySlug}`,
              },
            ]
          : []),
        {
          '@type': 'ListItem',
          position: (artwork.parentCategorySlug ? 2 : 1) + (artwork.categorySlug ? 2 : 1),
          name: cleanTitle,
          item: canonicalUrl,
        },
      ],
    },
  ]

  return (
    <main className="min-h-screen bg-neutral-950 pt-3 sm:pt-4 pb-16 px-2 sm:px-6 md:px-10 max-w-[2400px] mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* 1. Compact Top Breadcrumb & Page-Turn Navigation Bar */}
      <nav className="mb-2 sm:mb-3 px-2 sm:px-4 text-[11px] sm:text-xs text-neutral-400 uppercase tracking-wider sm:tracking-widest font-mono flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-y-1">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span className="mx-1.5 sm:mx-2.5 text-neutral-600">/</span>
          {artwork.parentCategorySlug && (
            <>
              <Link href={`/category/${artwork.parentCategorySlug}`} className="hover:text-white transition-colors">
                {artwork.parentCategoryTitle}
              </Link>
              <span className="mx-1.5 sm:mx-2.5 text-neutral-600">/</span>
            </>
          )}
          {artwork.categorySlug ? (
            <>
              <Link
                href={
                  artwork.parentCategorySlug
                    ? `/category/${artwork.parentCategorySlug}/${artwork.categorySlug}`
                    : `/category/${artwork.categorySlug}`
                }
                className="hover:text-white transition-colors"
              >
                {artwork.categoryTitle}
              </Link>
              <span className="mx-1.5 sm:mx-2.5 text-neutral-600">/</span>
            </>
          ) : (
            <>
              <Link href="/" className="hover:text-white transition-colors">Exhibitions</Link>
              <span className="mx-1.5 sm:mx-2.5 text-neutral-600">/</span>
            </>
          )}
          <span className="text-white break-words">{cleanTitle}</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {prevArt && (
            <Link
              href={`/art/${prevArt.slug}`}
              className="px-3 py-1 rounded-full bg-neutral-900 border border-white/15 text-neutral-200 hover:text-white hover:border-white/40 transition-colors"
            >
              &larr; Prev Page
            </Link>
          )}
          {nextArt && (
            <Link
              href={`/art/${nextArt.slug}`}
              className="px-3 py-1 rounded-full bg-neutral-900 border border-white/15 text-neutral-200 hover:text-white hover:border-white/40 transition-colors"
            >
              Next Page &rarr;
            </Link>
          )}
        </div>
      </nav>

      {/* 2. Full-Viewport Cinematic Picture-Book Stage */}
      <div className="relative w-full group/nav">
        <ImageZoom
          src={urlForImage(artwork.image).width(2400).quality(95).auto('format').url()}
          alt={cleanTitle}
        />

        {/* Large Picture-Book Page-Turn Arrows on Left & Right Edges */}
        {prevArt && (
          <div className="absolute inset-y-0 left-0 flex items-center justify-start pl-1.5 sm:pl-4 pointer-events-none">
            <Link
              href={`/art/${prevArt.slug}`}
              aria-label="Previous Photograph"
              title="Turn to Previous Photograph"
              className="pointer-events-auto bg-black/70 hover:bg-black/90 text-white p-2 sm:p-4 rounded-full border border-white/20 hover:border-white/50 backdrop-blur-md transition-all shadow-2xl opacity-80 group-hover/nav:opacity-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-5 h-5 sm:w-8 sm:h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </Link>
          </div>
        )}

        {nextArt && (
          <div className="absolute inset-y-0 right-0 flex items-center justify-end pr-1.5 sm:pr-4 pointer-events-none">
            <Link
              href={`/art/${nextArt.slug}`}
              aria-label="Next Photograph"
              title="Turn to Next Photograph"
              className="pointer-events-auto bg-black/70 hover:bg-black/90 text-white p-2 sm:p-4 rounded-full border border-white/20 hover:border-white/50 backdrop-blur-md transition-all shadow-2xl opacity-80 group-hover/nav:opacity-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-5 h-5 sm:w-8 sm:h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          </div>
        )}
      </div>

      {/* 3. Immediate Picture-Book Title Plaque (Directly Under the Maximized Photo) */}
      <section className="max-w-5xl mx-auto px-3 sm:px-6 pt-3 sm:pt-5 pb-5 sm:pb-6 text-center text-white">
        <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-light tracking-wide break-words leading-snug">
          {cleanTitle}
        </h1>

        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mt-2.5 sm:mt-3">
          {artwork.species && (
            <Link
              href={`/species/${encodeURIComponent(artwork.species)}`}
              className="text-emerald-400 hover:text-emerald-300 text-[11px] sm:text-xs font-mono uppercase tracking-widest border border-emerald-500/30 bg-emerald-950/30 px-2.5 sm:px-3 py-1 rounded transition-colors"
            >
              Species: {artwork.species} ↗
            </Link>
          )}
          {artwork.location && (
            <p className="text-neutral-400 text-[11px] sm:text-sm font-mono uppercase tracking-widest">
              {artwork.location} {artwork.year && `• ${artwork.year}`}
            </p>
          )}
          {artwork.edition && (
            <p className="text-neutral-500 text-[11px] sm:text-xs font-mono uppercase tracking-widest border border-neutral-700 px-2 py-1 rounded-sm">
              {artwork.edition}
            </p>
          )}
        </div>

        {artwork.caption && artwork.caption !== cleanTitle && (
          <p className="text-neutral-300 text-sm sm:text-lg font-light leading-relaxed max-w-3xl mx-auto mt-3">
            {artwork.caption}
          </p>
        )}
      </section>

      {/* 4. Collector Options, Guest Artist Showcase, Story & Share Bar */}
      <section className="max-w-4xl mx-auto px-3.5 sm:px-8 pt-5 sm:pt-6 border-t border-neutral-900 text-white space-y-6 sm:space-y-8">
        {artwork.guestPhotographer && (
          <div className="p-4 sm:p-6 bg-emerald-950/30 border border-emerald-500/40 rounded-lg space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-emerald-400 text-[11px] sm:text-xs font-mono uppercase tracking-widest">
                ★ Curated By Invitation • Featured Guest Photographer
              </p>
              <Link
                href="/category/guest-photos"
                className="text-[11px] font-mono uppercase tracking-wider text-emerald-300/80 hover:text-white transition-colors"
              >
                Guest Showcase &rarr;
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
              <p className="text-xl sm:text-2xl font-light text-white">{artwork.guestPhotographer}</p>
              {artwork.guestSocialUrl && (
                <a
                  href={artwork.guestSocialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 bg-emerald-500/20 border border-emerald-400/40 rounded text-xs font-mono uppercase tracking-widest text-emerald-200 hover:bg-emerald-500/30 hover:text-white transition-colors"
                >
                  Visit Photographer&apos;s Page ↗
                </a>
              )}
            </div>
            {artwork.guestNote && (
              <p className="text-neutral-200 text-sm font-light leading-relaxed pt-3 border-t border-emerald-500/20 italic">
                &ldquo;{artwork.guestNote}&rdquo;
              </p>
            )}
          </div>
        )}

        {artwork.story && (
          <div className="prose prose-invert prose-p:text-neutral-300 prose-p:font-light prose-p:leading-relaxed prose-base sm:prose-lg mx-auto">
            <PortableText value={artwork.story} />
          </div>
        )}

        <div className="flex flex-col items-center">
          {isAcquired && (
            <div className="mb-5 inline-block bg-neutral-900 border border-neutral-800 px-4 py-2 text-xs font-mono uppercase tracking-widest text-neutral-400">
              ● Acquired (Private Collection)
            </div>
          )}
          {isReserved && (
            <div className="mb-5 inline-block bg-amber-950/30 border border-amber-900/50 px-4 py-2 text-xs font-mono uppercase tracking-widest text-amber-500">
              ● Currently Reserved
            </div>
          )}

          <div className="w-full flex justify-center">
            <Suspense fallback={null}>
              <ArtworkOptions
                inquiryLink={inquiryLink}
                isReserved={isReserved}
                isAcquired={isAcquired}
                imageUrl={urlForImage(artwork.image).width(1600).url()}
                artworkTitle={cleanTitle}
              />
            </Suspense>
          </div>

          <div className="w-full mt-7 sm:mt-8 pt-5 sm:pt-6 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono uppercase tracking-widest text-neutral-500">
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <span>Share:</span>
              <a href={fbShareUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                Facebook
              </a>
              <a href={xShareUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                X (Twitter)
              </a>
              <a href={pinterestShareUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                Pinterest
              </a>
            </div>
            {artwork.categorySlug && (
              <Link
                href={
                  artwork.parentCategorySlug
                    ? `/category/${artwork.parentCategorySlug}/${artwork.categorySlug}`
                    : `/category/${artwork.categorySlug}`
                }
                className="text-neutral-400 hover:text-white transition-colors"
              >
                &larr; Return to {artwork.categoryTitle}
              </Link>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
