'use client'

import { useState } from 'react'
import Image from 'next/image'
import { urlForImage } from '../../sanity/lib/image'

export default function ArtworkCard({ artwork }) {
  const [isHovered, setIsHovered] = useState(false)

  // Fallback if no image is uploaded
  if (!artwork.image) return null

  // Ensure price is formatted nicely
  const formattedPrice = artwork.price ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(artwork.price) : null

  return (
    <div 
      className="group relative cursor-pointer overflow-hidden rounded-sm transition-all duration-700 ease-out mb-8 break-inside-avoid"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 
        We use standard img tag instead of next/image for masonry layout 
        because we need the image to dictate its own height in the column.
      */}
      <img
        src={urlForImage(artwork.image).width(1200).auto('format').url()}
        alt={artwork.title}
        className="w-full h-auto object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-[1.03]"
        loading="lazy"
      />

      {/* Subtle Overlay (Whisper Commerce & Focus Mode hint) */}
      <div 
        className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
      >
        <h3 className="text-white text-2xl font-light mb-1">{artwork.title}</h3>
        {artwork.location && <p className="text-neutral-300 text-sm mb-3 font-mono uppercase tracking-widest">{artwork.location} {artwork.year && `• ${artwork.year}`}</p>}
        
        {formattedPrice && (
          <div className="mt-4 pt-4 border-t border-white/20 flex justify-between items-center">
            <span className="text-white/70 text-sm font-light">Acquire Print</span>
            <span className="text-white text-sm font-medium">{formattedPrice}</span>
          </div>
        )}
      </div>
    </div>
  )
}
