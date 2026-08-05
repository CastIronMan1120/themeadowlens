'use client'

import { useState, useEffect } from 'react'
import { urlForImage } from '../../sanity/lib/image'
import { PortableText } from '@portabletext/react'

export default function ArtworkCard({ artwork }) {
  const [isHovered, setIsHovered] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isFocused) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isFocused])

  // Fallback if no image is uploaded
  if (!artwork.image) return null

  // Inquiry Email Link
  const inquirySubject = encodeURIComponent(`Private Inquiry: ${artwork.title}`)
  const inquiryBody = encodeURIComponent(`Hello David,\n\nI am interested in learning more about "${artwork.title}". Please let me know about its availability and sizing options.\n\nThank you,`)
  const mailtoLink = `mailto:DMC1120@themeadowlens.com?subject=${inquirySubject}&body=${inquiryBody}`

  return (
    <>
      {/* 1. THE MASONRY GRID ITEM */}
      <div 
        className="group relative cursor-pointer overflow-hidden rounded-sm transition-all duration-700 ease-out mb-8 break-inside-avoid"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsFocused(true)}
      >
        <img
          src={urlForImage(artwork.image).width(1200).auto('format').url()}
          alt={artwork.title}
          className="w-full h-auto object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-[1.03]"
          loading="lazy"
        />

        {/* Subtle Overlay Hint */}
        <div 
          className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
        >
          <h3 className="text-white text-2xl font-light mb-1">{artwork.title}</h3>
          {artwork.location && <p className="text-neutral-300 text-sm mb-3 font-mono uppercase tracking-widest">{artwork.location} {artwork.year && `• ${artwork.year}`}</p>}
          <div className="mt-4 pt-4 border-t border-white/20">
             <span className="text-white/80 text-xs tracking-widest uppercase font-semibold">Enter Focus Mode</span>
          </div>
        </div>
      </div>

      {/* 2. THE FOCUS MODE MODAL (Prestige Gallery View) */}
      {isFocused && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/98 p-4 md:p-12 overflow-y-auto">
          {/* Close Button */}
          <button 
            onClick={() => setIsFocused(false)}
            className="absolute top-6 right-8 text-white/50 hover:text-white transition-colors z-50 text-4xl font-light"
          >
            &times;
          </button>

          <div className="max-w-7xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 items-center">
            
            {/* Left: The Uninterrupted Image */}
            <div className="w-full flex justify-center">
              <img
                src={urlForImage(artwork.image).width(2000).auto('format').url()}
                alt={artwork.title}
                className="max-h-[85vh] w-auto object-contain shadow-2xl"
              />
            </div>

            {/* Right: The Title, Optional Story, and Inquiry Guestbook */}
            <div className="flex flex-col justify-center space-y-8 text-white max-w-lg">
              
              <div>
                <h2 className="text-4xl md:text-5xl font-light tracking-wide mb-2">{artwork.title}</h2>
                {artwork.location && (
                  <p className="text-neutral-400 text-sm font-mono uppercase tracking-widest">
                    {artwork.location} {artwork.year && `• ${artwork.year}`}
                  </p>
                )}
              </div>

              {/* The Story is entirely optional. If blank, this disappears. */}
              {artwork.story && (
                <div className="prose prose-invert prose-p:text-neutral-300 prose-p:font-light prose-p:leading-relaxed text-lg">
                  <PortableText value={artwork.story} />
                </div>
              )}

              {/* The Prestige Inquiry CTA */}
              <div className="pt-8 border-t border-white/10 mt-8">
                <p className="text-neutral-400 text-sm mb-6 italic">
                  This piece is available for acquisition. To discuss dimensions, archival framing, or provenance, please leave a private inquiry.
                </p>
                <a 
                  href={mailtoLink}
                  className="inline-block bg-white text-black px-8 py-4 uppercase tracking-widest text-sm font-semibold hover:bg-neutral-200 transition-colors"
                >
                  Inquire About This Piece
                </a>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  )
}
