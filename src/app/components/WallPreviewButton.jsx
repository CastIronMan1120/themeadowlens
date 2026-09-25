'use client'
import { useState } from 'react'
import WallPreviewStudio from './WallPreviewStudio'

export default function WallPreviewButton({ imageUrl, artworkTitle }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full mt-6 border border-neutral-700 bg-neutral-900 text-white px-10 py-5 uppercase tracking-widest text-sm font-semibold hover:bg-neutral-800 transition-colors"
      >
        Visualize in Room
      </button>

      {isOpen && (
        <WallPreviewStudio 
          imageUrl={imageUrl}
          artworkTitle={artworkTitle}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
