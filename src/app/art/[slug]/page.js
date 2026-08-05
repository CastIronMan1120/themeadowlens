import { client } from '../../../sanity/lib/client'
import { urlForImage } from '../../../sanity/lib/image'
import { PortableText } from '@portabletext/react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const revalidate = 0

// Dynamic SEO Metadata Generation for Facebook/Social Sharing
export async function generateMetadata({ params }) {
  const { slug } = await params
  const artwork = await client.fetch(`*[_type == "artwork" && slug.current == $slug][0]`, { slug })
  
  if (!artwork) return {}

  const imageUrl = artwork.image ? urlForImage(artwork.image).width(1200).height(630).url() : ''

  return {
    title: `${artwork.title} | The Meadow Lens`,
    description: `Experience the story behind "${artwork.title}" by David. High-end fine art photography.`,
    openGraph: {
      title: `${artwork.title} | The Meadow Lens`,
      description: `Experience the story behind "${artwork.title}" by David. High-end fine art photography.`,
      images: [{ url: imageUrl }],
      type: 'website',
    },
  }
}

export default async function ArtworkPage({ params }) {
  const { slug } = await params
  const artwork = await client.fetch(`*[_type == "artwork" && slug.current == $slug][0]`, { slug })

  if (!artwork) {
    notFound()
  }

  // Inquiry Email Link
  const inquirySubject = encodeURIComponent(`Private Inquiry: ${artwork.title}`)
  const inquiryBody = encodeURIComponent(`Hello David,\n\nI am interested in learning more about "${artwork.title}". Please let me know about its availability and sizing options.\n\nThank you,`)
  const mailtoLink = `mailto:dmc1120@themeadowlens.com?subject=${inquirySubject}&body=${inquiryBody}`

  // Social Share URLs
  // Note: We use window.location.href dynamically in client, but since this is server component, we use relative or the assumed domain.
  // Assuming standard domain is themeadowlens.vercel.app for now.
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

      {/* 2. Cinematic Focus Mode Layout */}
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
            {artwork.location && (
              <p className="text-neutral-400 text-sm font-mono uppercase tracking-widest">
                {artwork.location} {artwork.year && `• ${artwork.year}`}
              </p>
            )}
          </div>

          {/* The Story is entirely optional. If blank, this disappears. */}
          {artwork.story && (
            <div className="prose prose-invert prose-p:text-neutral-300 prose-p:font-light prose-p:leading-relaxed prose-lg">
              <PortableText value={artwork.story} />
            </div>
          )}

          {/* The Prestige Inquiry CTA */}
          <div className="pt-10 border-t border-white/10">
            <p className="text-neutral-400 text-sm mb-6 italic leading-relaxed">
              This piece is available for acquisition. To discuss dimensions, archival framing, or provenance, please leave a private inquiry.
            </p>
            <a 
              href={mailtoLink}
              className="inline-block bg-white text-black px-10 py-5 uppercase tracking-widest text-sm font-semibold hover:bg-neutral-200 transition-colors"
            >
              Inquire About This Piece
            </a>
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
    </main>
  )
}
