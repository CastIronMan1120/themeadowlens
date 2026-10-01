'use client'

import { useState } from 'react'
import Link from 'next/link'
import WallPreviewStudio from './WallPreviewStudio'

export default function ArtworkOptions({ inquiryLink, isReserved, isAcquired, imageUrl, artworkTitle }) {
  const [isOpen, setIsOpen] = useState(false)
  const [studioOpen, setStudioOpen] = useState(false)

  return (
    <div className="relative inline-block w-full max-w-xs">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between border border-white/20 bg-neutral-900 text-white px-6 py-4 uppercase tracking-widest text-sm font-light hover:bg-neutral-800 transition-colors"
      >
        <span>Options for this image</span>
        <span className="text-lg font-mono ml-4">{isOpen ? '-' : '+'}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-2 flex flex-col bg-neutral-950 border border-white/10 shadow-2xl z-40">
          
          {!isAcquired && (
            <Link 
              href={inquiryLink}
              scroll={false}
              className="px-6 py-4 border-b border-white/5 text-neutral-300 hover:text-white hover:bg-white/5 uppercase tracking-widest text-xs font-semibold transition-colors"
            >
              {isReserved ? "Join Waitlist" : "Inquire About This Piece"}
            </Link>
          )}

          <button 
            onClick={() => setStudioOpen(true)}
            className="px-6 py-4 text-left text-neutral-300 hover:text-white hover:bg-white/5 uppercase tracking-widest text-xs font-semibold transition-colors"
          >
            Visualize in a Room
          </button>
        </div>
      )}

      {studioOpen && (
        <WallPreviewStudio 
          imageUrl={imageUrl} 
          artworkTitle={artworkTitle} 
          onClose={() => setStudioOpen(false)} 
        />
      )}
    </div>
  )
}
