'use client'

import { useState } from 'react'
import Link from 'next/link'
import { urlForImage } from '../../sanity/lib/image'

const ROOM_TEMPLATES = {
  'living-room': 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=2000&auto=format&fit=crop',
  'dark-gallery': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2000&auto=format&fit=crop',
  'office': 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000&auto=format&fit=crop'
}

export default function ArtworkCard({ artwork, fallbackDescription }) {
  const [isHovered, setIsHovered] = useState(false)
  const [liked, setLiked] = useState(false)
  const [shared, setShared] = useState(false)

  if (!artwork.image || !artwork.slug?.current) return null

  const roomBg = ROOM_TEMPLATES[artwork.roomSetting] || ROOM_TEMPLATES['dark-gallery']
  const artworkUrl = `/art/${artwork.slug.current}`

  const handleShare = (e) => {
    e.preventDefault()
    e.stopPropagation()
    navigator.clipboard.writeText(`https://themeadowlens.com${artworkUrl}`)
    setShared(true)
    setTimeout(() => setShared(false), 2000)
  }

  const handleLike = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setLiked(!liked)
  }

  const displayCaption = artwork.guestNote || artwork.caption || fallbackDescription

  return (
    <div 
      className="group relative overflow-hidden rounded-sm mb-6 sm:mb-8 break-inside-avoid bg-neutral-950 border border-white/10 lg:border-0 flex flex-col lg:block lg:aspect-[4/3]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container: Unobstructed 4:3 on Smartphones, Full Bleed on Desktop */}
      <div className="relative w-full aspect-[4/3] lg:aspect-auto lg:absolute lg:inset-0 bg-neutral-900 overflow-hidden">
        {/* Persistent Top-Left Guest Artist Badge when guestPhotographer is present */}
        {artwork.guestPhotographer && (
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 pointer-events-none bg-emerald-950/90 border border-emerald-500/50 backdrop-blur-md px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full flex items-center gap-2 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-emerald-200">
              Featured Guest: {artwork.guestPhotographer}
            </span>
          </div>
        )}

        <Link href={artworkUrl} className="absolute inset-0 z-0 block">
          <img
            src={urlForImage(artwork.image).width(1600).quality(90).auto('format').url()}
            alt={artwork.displayTitle || artwork.title}
            className="w-full h-full object-cover transition-transform duration-[2s] ease-out lg:group-hover:scale-105 opacity-95 lg:opacity-90 lg:group-hover:opacity-60"
            loading="lazy"
          />
          <div className="hidden lg:block absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 transition-opacity duration-700 lg:group-hover:opacity-100"></div>
        </Link>
      </div>

      {/* Typography Context: Stacked cleanly below photo on Smartphones, Floating Hover on Desktop */}
      <div 
        className="relative lg:absolute lg:inset-x-0 lg:bottom-20 p-4 sm:p-5 lg:p-10 flex flex-col justify-end lg:pointer-events-none transition-all duration-700 z-10 lg:opacity-0 lg:translate-y-4 lg:group-hover:opacity-100 lg:group-hover:translate-y-0"
      >
        <Link href={artworkUrl} className="lg:pointer-events-none">
          <h3 className="text-white text-xl sm:text-2xl lg:text-4xl xl:text-5xl font-light mb-1.5 lg:mb-2 drop-shadow-2xl leading-snug">
            {artwork.displayTitle || artwork.title}
          </h3>
        </Link>
        {artwork.guestPhotographer && (
          <p className="text-emerald-400 text-[11px] lg:text-sm font-mono uppercase tracking-widest mb-2 lg:mb-3 drop-shadow-md">
            ★ Invited Guest Photographer: {artwork.guestPhotographer}
          </p>
        )}
        
        {displayCaption && displayCaption !== (artwork.displayTitle || artwork.title) && (
          <p className="text-neutral-300 lg:text-neutral-200 text-xs sm:text-sm lg:text-base font-light leading-relaxed drop-shadow-md line-clamp-2 lg:line-clamp-3">
            {displayCaption}
          </p>
        )}
      </div>

      {/* Action Bar: Compact footer strip below photo on Smartphones, Slide-up bar on Desktop */}
      <div 
        className="relative lg:absolute lg:bottom-0 lg:left-0 w-full px-4 py-3 sm:px-5 sm:py-4 lg:p-6 flex flex-wrap items-center justify-between bg-neutral-950 lg:bg-black/70 lg:backdrop-blur-md border-t border-white/10 transition-transform duration-700 z-20 lg:translate-y-full lg:group-hover:translate-y-0 gap-3"
      >
        <div className="flex flex-wrap gap-2 sm:gap-3 flex-1 sm:flex-initial">
          <Link 
            href={artworkUrl}
            className="flex-1 sm:flex-initial px-4 sm:px-5 py-2 bg-white text-black font-semibold text-[11px] lg:text-xs uppercase tracking-widest hover:bg-neutral-200 transition-colors text-center"
          >
            View &amp; Inquire
          </Link>
          <Link 
            href={artworkUrl}
            className="flex-1 sm:flex-initial px-3.5 sm:px-4 py-2 border border-white/30 text-white font-semibold text-[11px] lg:text-xs uppercase tracking-widest hover:border-white transition-colors text-center"
          >
            Room View
          </Link>
          {artwork.guestSocialUrl && (
            <a
              href={artwork.guestSocialUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="px-3.5 py-2 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-mono text-[11px] uppercase tracking-widest hover:bg-emerald-900 hover:text-white transition-colors text-center"
            >
              Artist Page ↗
            </a>
          )}
        </div>

        <div className="flex items-center space-x-4 sm:space-x-6 justify-end">
          <button onClick={handleLike} className="flex items-center text-xs sm:text-sm uppercase tracking-widest text-white/80 hover:text-white transition-colors">
            <span className="mr-1.5">{liked ? '♥' : '♡'}</span>
            {liked ? 'Loved' : 'Like'}
          </button>
          
          <button onClick={handleShare} className="flex items-center text-xs sm:text-sm uppercase tracking-widest text-white/80 hover:text-white transition-colors">
            <span className="mr-1.5">↗</span>
            {shared ? 'Copied' : 'Share'}
          </button>
        </div>
      </div>
      
    </div>
  )
}

