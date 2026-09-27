'use client'

import { useState } from 'react'
import ArtworkCard from './ArtworkCard'

export default function Gallery({ artworks }) {
  const [visibleCount, setVisibleCount] = useState(12)

  if (!artworks || artworks.length === 0) return null

  const visibleArtworks = artworks.slice(0, visibleCount)
  const hasMore = visibleCount < artworks.length

  return (
    <div className="flex flex-col items-center">
      <div className="w-full columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-8 space-y-8 relative">
        {visibleArtworks.map((artwork) => (
          <ArtworkCard key={artwork._id} artwork={artwork} />
        ))}
        
        {hasMore && (
          <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-neutral-950 to-transparent pointer-events-none flex items-end justify-center pb-8 z-10" />
        )}
      </div>

      {hasMore && (
        <button
          onClick={() => setVisibleCount(prev => prev + 12)}
          className="mt-16 px-12 py-4 border border-white/20 text-white tracking-[0.2em] uppercase text-sm hover:bg-white hover:text-black transition-all duration-300"
        >
          Load More Artwork
        </button>
      )}
    </div>
  )
}
