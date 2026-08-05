'use client'

import { useState } from 'react'
import Link from 'next/link'
import { urlForImage } from '../../sanity/lib/image'

export default function ArtworkCard({ artwork }) {
  const [isHovered, setIsHovered] = useState(false)

  // Fallback if no image is uploaded or no slug
  if (!artwork.image || !artwork.slug?.current) return null

  return (
    <Link href={`/art/${artwork.slug.current}`}>
      <div 
        className="group relative cursor-pointer overflow-hidden rounded-sm transition-all duration-700 ease-out mb-8 break-inside-avoid"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
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
             <span className="text-white/80 text-xs tracking-widest uppercase font-semibold">Enter Exhibition</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
