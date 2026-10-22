'use client'

import { useState } from 'react'

export default function ImageZoom({ src, alt }) {
  const [isZoomed, setIsZoomed] = useState(false)

  return (
    <>
      <div 
        className="w-full flex justify-center relative lg:sticky lg:top-24 group cursor-zoom-in select-none"
        onClick={() => setIsZoomed(true)}
        onContextMenu={(e) => e.preventDefault()}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          className="w-full max-h-[70vh] sm:max-h-[80vh] object-contain shadow-2xl transition-transform duration-500 group-hover:scale-[1.02] select-none"
        />
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-black/65 border border-white/15 px-2.5 py-1.5 sm:p-2 rounded-full opacity-90 lg:opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 justify-center backdrop-blur-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-6 sm:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
          <span className="lg:hidden text-[10px] font-mono uppercase tracking-wider text-white/90 pr-1">Zoom</span>
        </div>
      </div>

      {isZoomed && (
        <div 
          className="fixed inset-0 z-[100] bg-black/98 flex items-center justify-center p-2 sm:p-4 md:p-12 cursor-zoom-out select-none"
          onClick={() => setIsZoomed(false)}
          onContextMenu={(e) => e.preventDefault()}
        >
          <img
            src={src}
            alt={alt}
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
            className="max-w-full max-h-[92vh] sm:max-h-screen object-contain select-none"
          />
          <button
            type="button"
            aria-label="Close Fullscreen Image"
            className="absolute top-4 right-4 sm:top-8 sm:right-8 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </>
  )
}
