'use client'

import { useState } from 'react'

export default function ImageZoom({ src, alt }) {
  const [isZoomed, setIsZoomed] = useState(false)

  return (
    <>
      <div 
        className="w-full flex justify-center sticky top-24 group cursor-zoom-in"
        onClick={() => setIsZoomed(true)}
      >
        <img
          src={src}
          alt={alt}
          className="w-full max-h-[80vh] object-contain shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]"
        />
        <div className="absolute top-4 right-4 bg-black/50 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
        </div>
      </div>

      {isZoomed && (
        <div 
          className="fixed inset-0 z-[100] bg-black/98 flex items-center justify-center p-4 md:p-12 cursor-zoom-out"
          onClick={() => setIsZoomed(false)}
        >
          <img
            src={src}
            alt={alt}
            className="max-w-full max-h-screen object-contain"
          />
          <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </>
  )
}
