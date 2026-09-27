'use client'

import ArtworkCard from './ArtworkCard'

export default function Gallery({ artworks }) {
  if (!artworks || artworks.length === 0) return null

  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-8 space-y-8">
      {artworks.map((artwork) => (
        <ArtworkCard key={artwork._id} artwork={artwork} />
      ))}
    </div>
  )
}
