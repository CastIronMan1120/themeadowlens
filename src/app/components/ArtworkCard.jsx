'use client'

import { useState } from 'react'
import Link from 'next/link'
import { urlForImage } from '../../sanity/lib/image'

export default function ArtworkCard({ artwork, fallbackDescription }) {
  const [liked, setLiked] = useState(false)
  const [shared, setShared] = useState(false)

  if (!artwork.image || !artwork.slug?.current) return null

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

  const cleanTitle = artwork.displayTitle || artwork.title
  const displayCaption =
    artwork.guestNote ||
    (artwork.caption && artwork.caption !== cleanTitle ? artwork.caption : '')

  return (
    <div className="group relative overflow-hidden rounded-sm mb-6 sm:mb-8 break-inside-avoid bg-neutral-950 border border-white/10 hover:border-white/25 transition-colors duration-300 flex flex-col">
      {/* 1. Unobstructed Photograph Container (Never covered by text or popups on scroll/hover) */}
      <div className="relative w-full aspect-[4/3] bg-neutral-900 overflow-hidden">
        {artwork.guestPhotographer && (
          <div className="absolute top-3 left-3 z-20 pointer-events-none bg-emerald-950/90 border border-emerald-500/50 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-200">
              Guest: {artwork.guestPhotographer}
            </span>
          </div>
        )}

        <Link href={artworkUrl} className="block w-full h-full">
          <img
            src={urlForImage(artwork.image).width(1600).quality(90).auto('format').url()}
            alt={cleanTitle}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            loading="lazy"
          />
        </Link>
      </div>

      {/* 2. Clean Gallery Plaque Below Photo (Consistent on Laptop & Smartphone) */}
      <div className="p-3.5 sm:p-4 bg-neutral-950 flex flex-col gap-2.5 border-t border-white/10">
        <div className="flex items-start justify-between gap-2">
          <Link href={artworkUrl} className="min-w-0 flex-1 group/title">
            <h3
              className="text-white text-sm sm:text-base font-normal tracking-wide leading-snug truncate group-hover/title:text-emerald-300 transition-colors"
              title={cleanTitle}
            >
              {cleanTitle}
            </h3>
            {artwork.guestPhotographer && (
              <p className="text-emerald-400 text-[10px] font-mono uppercase tracking-wider mt-0.5 truncate">
                ★ By {artwork.guestPhotographer}
              </p>
            )}
            {displayCaption && (
              <p className="text-neutral-400 text-xs font-light line-clamp-1 mt-0.5">
                {displayCaption}
              </p>
            )}
          </Link>

          <div className="flex items-center gap-3 shrink-0 pt-0.5">
            <button
              type="button"
              onClick={handleLike}
              title={liked ? 'Loved' : 'Like this photo'}
              className="text-xs font-mono uppercase tracking-wider text-neutral-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <span className={liked ? 'text-rose-400' : ''}>{liked ? '♥' : '♡'}</span>
              <span className="hidden xl:inline text-[10px]">{liked ? 'Loved' : 'Like'}</span>
            </button>
            <button
              type="button"
              onClick={handleShare}
              title="Copy link to photo"
              className="text-xs font-mono uppercase tracking-wider text-neutral-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <span>↗</span>
              <span className="text-[10px]">{shared ? 'Copied' : 'Share'}</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
          <div className="flex items-center gap-2 w-full">
            <Link
              href={artworkUrl}
              className="flex-1 px-3 py-1.5 bg-white/95 hover:bg-white text-black font-semibold text-[10px] sm:text-[11px] uppercase tracking-widest transition-colors text-center rounded-[2px]"
            >
              View &amp; Inquire
            </Link>
            <Link
              href={artworkUrl}
              className="flex-1 px-3 py-1.5 border border-white/25 hover:border-white text-neutral-200 hover:text-white font-mono text-[10px] sm:text-[11px] uppercase tracking-wider transition-colors text-center rounded-[2px]"
            >
              Room View
            </Link>
            {artwork.guestSocialUrl && (
              <a
                href={artwork.guestSocialUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="px-2.5 py-1.5 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] uppercase tracking-wider hover:bg-emerald-900 hover:text-white transition-colors text-center rounded-[2px]"
              >
                Artist ↗
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

