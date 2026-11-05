'use client'

import ArtworkCard from './ArtworkCard'

export default function Gallery({ artworks, fallbackDescription }) {
  if (!artworks || artworks.length === 0) return null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 items-start">
      {artworks.map((artwork) => (
        <ArtworkCard key={artwork._id} artwork={artwork} fallbackDescription={fallbackDescription} />
      ))}
    </div>
  )
}
