'use client'

import { useState } from 'react'

export default function ImageZoom({ src, alt }) {
  const [isZoomed, setIsZoomed] = useState(false)
  const [detailZoom, setDetailZoom] = useState(false)
  const [panOrigin, setPanOrigin] = useState({ x: 50, y: 50 })

  const handleMouseMove = (e) => {
    if (!detailZoom) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100))
    setPanOrigin({ x, y })
  }

  return (
    <>
      <div
        className="w-full flex items-center justify-center relative group cursor-zoom-in select-none bg-neutral-950/60 rounded-sm overflow-hidden"
        onClick={() => {
          setIsZoomed(true)
          setDetailZoom(false)
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          className="w-full h-[68vh] sm:h-[75vh] md:h-[79vh] lg:h-[81vh] object-contain shadow-2xl transition-transform duration-500 select-none"
        />
        <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 bg-black/70 border border-white/15 px-3 py-1.5 rounded-full opacity-85 lg:opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 justify-center backdrop-blur-sm pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
          <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-white/90">
            Full Screen &amp; Loupe
          </span>
        </div>
      </div>

      {isZoomed && (
        <div
          className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-0 select-none overflow-hidden"
          onClick={() => {
            setIsZoomed(false)
            setDetailZoom(false)
          }}
          onMouseMove={handleMouseMove}
          onContextMenu={(e) => e.preventDefault()}
        >
          <img
            src={src}
            alt={alt}
            draggable={false}
            onClick={(e) => {
              e.stopPropagation()
              setDetailZoom((prev) => !prev)
            }}
            onContextMenu={(e) => e.preventDefault()}
            style={{
              transformOrigin: detailZoom ? `${panOrigin.x}% ${panOrigin.y}%` : '50% 50%',
              transform: detailZoom ? 'scale(2.15)' : 'scale(1)',
              transition: detailZoom ? 'transform 0.08s ease-out' : 'transform 0.25s ease-out',
            }}
            className={`w-screen h-screen object-contain select-none ${
              detailZoom ? 'cursor-zoom-out' : 'cursor-zoom-in'
            }`}
          />

          <div
            className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2 sm:gap-3 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setDetailZoom((prev) => !prev)}
              className="px-3.5 py-2 rounded-full bg-black/80 border border-white/25 text-white text-xs font-mono uppercase tracking-wider hover:bg-white/20 transition-colors backdrop-blur-md"
            >
              {detailZoom ? 'Fit Full Screen (1×)' : '🔍 2× Optical Loupe'}
            </button>
            <button
              type="button"
              aria-label="Close Fullscreen Image"
              onClick={() => {
                setIsZoomed(false)
                setDetailZoom(false)
              }}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/80 border border-white/25 flex items-center justify-center text-white hover:bg-white/20 transition-colors backdrop-blur-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
