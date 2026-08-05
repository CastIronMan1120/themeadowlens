'use client'

import { useState } from 'react'
import Link from 'next/link'
import { urlForImage } from '../../sanity/lib/image'

const ROOM_TEMPLATES = {
  'living-room': 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=2000&auto=format&fit=crop',
  'dark-gallery': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2000&auto=format&fit=crop',
  'office': 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000&auto=format&fit=crop'
}

export default function ArtworkCard({ artwork }) {
  const [isHovered, setIsHovered] = useState(false)

  if (!artwork.image || !artwork.slug?.current) return null

  // Determine which room to use (default to dark gallery if not set)
  const roomBg = ROOM_TEMPLATES[artwork.roomSetting] || ROOM_TEMPLATES['dark-gallery']

  return (
    <Link href={`/art/${artwork.slug.current}`}>
      <div 
        className="group relative cursor-pointer overflow-hidden rounded-sm mb-12 break-inside-avoid aspect-[4/3] bg-neutral-900"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* The Room Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[2s] ease-out group-hover:scale-105 group-hover:blur-[2px] opacity-80"
          style={{ backgroundImage: `url('${roomBg}')` }}
        ></div>

        {/* The Dark Overlay for mood */}
        <div className="absolute inset-0 bg-black/40 transition-opacity duration-700 group-hover:bg-black/70"></div>

        {/* The Composited Artwork on the Wall */}
        <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-8 md:p-12 lg:p-16">
          <img
            src={urlForImage(artwork.image).width(1200).auto('format').url()}
            alt={artwork.title}
            className="max-w-full max-h-full object-contain shadow-[0_20px_50px_rgba(0,0,0,0.7)] transition-all duration-[1s] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-[1.15] group-hover:-translate-y-4 group-hover:shadow-[0_40px_80px_rgba(0,0,0,0.9)] z-10"
            loading="lazy"
          />
        </div>

        {/* Floating Typography Context */}
        <div 
          className={`absolute bottom-0 left-0 w-full p-8 flex flex-col justify-end bg-gradient-to-t from-black/90 to-transparent transition-opacity duration-700 z-20 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
        >
          <h3 className="text-white text-3xl font-light mb-2">{artwork.title}</h3>
          {artwork.location && <p className="text-neutral-300 text-sm font-mono uppercase tracking-widest">{artwork.location}</p>}
        </div>
      </div>
    </Link>
  )
}
