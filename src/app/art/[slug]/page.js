import { client } from '../../../sanity/lib/client'
import { urlForImage } from '../../../sanity/lib/image'
import { PortableText } from '@portabletext/react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import RoomSettingViewer from '../../components/RoomSettingViewer'

export const revalidate = 0

// Dynamic SEO Metadata Generation for Facebook/Social Sharing
export async function generateMetadata({ params }) {
  const { slug } = await params
  const artwork = await client.fetch(`*[_type == "artwork" && slug.current == $slug][0]`, { slug })
  
  if (!artwork) return {}

  const imageUrl = artwork.image ? urlForImage(artwork.image).width(1200).height(630).url() : ''
  const dynamicKeywords = [artwork.title, artwork.species, artwork.dominantColor, artwork.location, 'Fine Art Photography', 'The Meadow Lens'].filter(Boolean)

  const metaTitle = artwork.seo?.metaTitle || `${artwork.title} | The Meadow Lens`
  const metaDesc = artwork.seo?.metaDescription || `Experience the story behind "${artwork.title}" by David McClure. High-end fine art photography.`
  const keywords = artwork.seo?.keywords?.length > 0 ? artwork.seo.keywords : dynamicKeywords

  return {
    title: metaTitle,
    description: metaDesc,
    keywords: keywords,
    openGraph: {
      title: metaTitle,
      description: metaDesc,
      images: [{ url: imageUrl }],
      type: 'website',
    },
  }
}

export default async function ArtworkPage({ params, searchParams }) {
  const { slug } = await params
  const resolvedSearchParams = await searchParams
  const isRoomView = resolvedSearchParams?.view === 'room'

  const artwork = await client.fetch(`*[_type == "artwork" && slug.current == $slug][0]`, { slug })

  if (!artwork) {
    notFound()
  }

  // Inquiry Email Link
  const inquirySubject = encodeURIComponent(`Private Inquiry: ${artwork.title}`)
  const inquiryBody = encodeURIComponent(`Hello David,\n\nI am interested in learning more about "${artwork.title}". Please let me know about its availability and sizing options.\n\nThank you,`)
  const mailtoLink = `mailto:dmc1120@themeadowlens.com?subject=${inquirySubject}&body=${inquiryBody}`

  // Status Logic
  const status = artwork.status || 'available'
  const isAvailable = status === 'available'
  const isReserved = status === 'reserved'
  const isAcquired = status === 'acquired'

  // Social Share URLs
  const pageUrl = encodeURIComponent(`https://themeadowlens.vercel.app/art/${slug}`)
  const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`
  const xShareUrl = `https://twitter.com/intent/tweet?url=${pageUrl}&text=Experience%20this%20stunning%20piece%20by%20The%20Meadow%20Lens.`
  const pinterestShareUrl = `https://pinterest.com/pin/create/button/?url=${pageUrl}&media=${encodeURIComponent(urlForImage(artwork.image).url())}&description=${encodeURIComponent(artwork.title)}`

  return (
    <main className="min-h-screen pt-24 pb-12 px-8 sm:px-12 md:px-24 max-w-[2000px] mx-auto">
      
      {/* 1. SEO Industry Standard Breadcrumbs */}
      <nav className="mb-12 text-sm text-neutral-500 uppercase tracking-widest font-mono">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <span className="mx-3">/</span>
        <Link href="/" className="hover:text-white transition-colors">Exhibitions</Link>
        <span className="mx-3">/</span>
        <span className="text-white">{artwork.title}</span>
      </nav>

      {/* Conditional Rendering: Room View vs Focus Mode */}
      {isRoomView ? (
        <div className="mb-24">
          <h1 className="text-4xl md:text-5xl font-light tracking-wide mb-8 text-white text-center">Virtual Exhibition</h1>
          <RoomSettingViewer 
            artworkUrl={urlForImage(artwork.image).width(1200).auto('format').url()}
            title={artwork.title}
            returnPath={`/art/${slug}`}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">
          
          {/* Left: The Uninterrupted Image */}
          <div className="w-full flex justify-center sticky top-24">
            <img
              src={urlForImage(artwork.image).width(2000).auto('format').url()}
              alt={artwork.title}
              className="w-full max-h-[80vh] object-contain shadow-2xl"
            />
          </div>

          {/* Right: The Title, Optional Story, and Inquiry Guestbook */}
          <div className="flex flex-col justify-center space-y-10 text-white lg:py-12">
            
            <div>
              <h1 className="text-5xl md:text-6xl font-light tracking-wide mb-4">{artwork.title}</h1>
            <div className="flex items-center space-x-4">
              {artwork.location && (
                <p className="text-neutral-400 text-sm font-mono uppercase tracking-widest">
                  {artwork.location} {artwork.year && `• ${artwork.year}`}
                </p>
              )}
              {artwork.edition && (
                <p className="text-neutral-500 text-xs font-mono uppercase tracking-widest border border-neutral-700 px-2 py-1 rounded-sm">
                  {artwork.edition}
                </p>
              )}
            </div>
          </div>

          {/* The Story is entirely optional. If blank, this disappears. */}
          {artwork.story && (
            <div className="prose prose-invert prose-p:text-neutral-300 prose-p:font-light prose-p:leading-relaxed prose-lg">
              <PortableText value={artwork.story} />
            </div>
          )}

          {/* The Prestige Inquiry CTA */}
          <div className="pt-10 border-t border-white/10">
            {isAcquired ? (
              <div className="inline-block bg-neutral-900 border border-neutral-800 text-neutral-500 px-10 py-5 uppercase tracking-widest text-sm font-semibold cursor-not-allowed">
                Acquired by Private Collector
              </div>
            ) : isReserved ? (
              <>
                <p className="text-neutral-400 text-sm mb-6 italic leading-relaxed">
                  This piece is currently reserved. You may leave an inquiry to join the waitlist.
                </p>
                <a 
                  href={mailtoLink}
                  className="inline-block border border-white text-white px-10 py-5 uppercase tracking-widest text-sm font-semibold hover:bg-white hover:text-black transition-colors"
                >
                  Join Waitlist
                </a>
              </>
            ) : (
              <>
                <p className="text-neutral-400 text-sm mb-6 italic leading-relaxed">
                  This piece is available for acquisition. To discuss dimensions, archival framing, or provenance, please leave a private inquiry.
                </p>
                <a 
                  href={mailtoLink}
                  className="inline-block bg-white text-black px-10 py-5 uppercase tracking-widest text-sm font-semibold hover:bg-neutral-200 transition-colors"
                >
                  Inquire About This Piece
                </a>
              </>
            )}
          </div>

          {/* Social Proof Sharing */}
          <div className="pt-10">
            <p className="text-neutral-500 text-xs uppercase tracking-widest mb-4">Share this piece</p>
            <div className="flex space-x-6">
              <a href={fbShareUrl} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors uppercase tracking-widest text-xs">Facebook</a>
              <a href={xShareUrl} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors uppercase tracking-widest text-xs">X (Twitter)</a>
              <a href={pinterestShareUrl} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors uppercase tracking-widest text-xs">Pinterest</a>
            </div>
          </div>

        </div>
        </div>
      )}
    </main>
  )
}
