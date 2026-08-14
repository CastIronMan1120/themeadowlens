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
  const [liked, setLiked] = useState(false)
  const [shared, setShared] = useState(false)

  if (!artwork.image || !artwork.slug?.current) return null

  const roomBg = ROOM_TEMPLATES[artwork.roomSetting] || ROOM_TEMPLATES['dark-gallery']
  const artworkUrl = `/art/${artwork.slug.current}`

  const handleShare = (e) => {
    e.preventDefault()
    e.stopPropagation()
    // In a real app, this would use window.location.origin, but since this is a relative path, we fake it for the demo
    navigator.clipboard.writeText(`https://themeadowlens.com${artworkUrl}`)
    setShared(true)
    setTimeout(() => setShared(false), 2000)
  }

  const handleLike = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setLiked(!liked)
  }

  return (
    <div 
      className="group relative overflow-hidden rounded-sm mb-12 break-inside-avoid aspect-[4/3] bg-neutral-900"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* The Main Clickable Area (Routes to Product Page) */}
      <Link href={artworkUrl} className="absolute inset-0 z-0">
        
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
            className="max-w-full max-h-full object-contain shadow-[0_20px_50px_rgba(0,0,0,0.7)] transition-all duration-[1s] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-[1.15] group-hover:-translate-y-8 group-hover:shadow-[0_40px_80px_rgba(0,0,0,0.9)]"
            loading="lazy"
          />
        </div>
      </Link>

      {/* Floating Typography Context */}
      <div 
        className={`absolute bottom-[80px] lg:bottom-20 left-0 w-full p-6 lg:p-8 flex flex-col justify-end pointer-events-none transition-all duration-700 z-10 opacity-100 translate-y-0 lg:opacity-0 lg:translate-y-4 lg:group-hover:opacity-100 lg:group-hover:translate-y-0`}
      >
        <h3 className="text-white text-2xl lg:text-3xl font-light mb-1 lg:mb-2 drop-shadow-lg">{artwork.title}</h3>
        {artwork.location && <p className="text-neutral-300 text-xs lg:text-sm font-mono uppercase tracking-widest drop-shadow-md">{artwork.location}</p>}
      </div>

      {/* The Passive Commerce Action Bar */}
      <div 
        className={`absolute bottom-0 left-0 w-full p-4 lg:p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between bg-black/80 lg:bg-black/60 backdrop-blur-md border-t border-white/10 transition-transform duration-700 z-20 translate-y-0 lg:translate-y-full lg:group-hover:translate-y-0 gap-4 lg:gap-0`}
      >
        <Link 
          href={artworkUrl}
          className="px-6 py-2 bg-white text-black font-semibold text-xs lg:text-sm uppercase tracking-widest hover:bg-neutral-200 transition-colors w-full lg:w-auto text-center"
        >
          Purchase / Inquire
        </Link>

        <div className="flex items-center space-x-6 w-full lg:w-auto justify-between lg:justify-end px-2 lg:px-0">
          <button onClick={handleLike} className="flex items-center text-sm uppercase tracking-widest text-white/80 hover:text-white transition-colors">
            <span className="mr-2">{liked ? '♥' : '♡'}</span>
            {liked ? 'Loved' : 'Like'}
          </button>
          
          <button onClick={handleShare} className="flex items-center text-sm uppercase tracking-widest text-white/80 hover:text-white transition-colors">
            <span className="mr-2">↗</span>
            {shared ? 'Copied' : 'Share'}
          </button>
        </div>
      </div>
      
    </div>
  )
}
