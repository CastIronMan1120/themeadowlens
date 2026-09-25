'use client'
import { useState } from 'react'
import Image from 'next/image'

export default function WallPreviewStudio({ imageUrl, artworkTitle, onClose }) {
  const [size, setSize] = useState(36) // default 36 inches wide
  const [wallColor, setWallColor] = useState('transparent')

  // Based on a 1:1 image where the couch is ~60% of the image width and an average couch is 80 inches long:
  // 1 inch = 0.75% of the container width.
  const printWidthPercent = size * 0.75

  const colors = [
    { name: 'Original', value: 'transparent' },
    { name: 'Gallery White', value: 'rgba(255, 255, 255, 0.4)' },
    { name: 'Charcoal', value: 'rgba(30, 30, 30, 0.6)' },
    { name: 'Navy Blue', value: 'rgba(10, 25, 50, 0.5)' },
    { name: 'Sage Green', value: 'rgba(80, 100, 80, 0.5)' },
  ]

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950 flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-6 border-b border-white/10 bg-black">
        <div>
          <h2 className="text-xl text-white font-light tracking-wide">{artworkTitle}</h2>
          <p className="text-neutral-500 font-mono text-xs uppercase tracking-widest mt-1">Interactive Wall Preview</p>
        </div>
        <button 
          onClick={onClose}
          className="text-neutral-400 hover:text-white uppercase font-mono text-sm tracking-widest transition-colors"
        >
          Close Studio [X]
        </button>
      </div>

      {/* Main Studio Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Left: Preview Window */}
        <div className="flex-1 bg-black flex items-center justify-center p-4 relative overflow-hidden">
          <div className="relative w-full max-w-5xl aspect-square shadow-2xl">
            {/* The Room Background */}
            <Image 
              src="/room-preview.jpg" 
              alt="Luxury Living Room"
              fill
              className="object-cover"
              priority
            />
            
            {/* Wall Color Overlay (Mix Blend Mode) */}
            <div 
              className="absolute inset-0 pointer-events-none mix-blend-multiply transition-colors duration-500"
              style={{ backgroundColor: wallColor }}
            />

            {/* The Artwork */}
            {/* Positioned centered above the couch. In the source image, the wall center is around top 32% */}
            <div 
              className="absolute left-1/2 -translate-x-1/2 transition-all duration-500 ease-out shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10"
              style={{ 
                width: `${printWidthPercent}%`,
                top: '32%',
                transform: 'translate(-50%, -50%)',
                aspectRatio: '3/2' // Assuming a standard 3:2 landscape photograph.
              }}
            >
              <Image 
                src={imageUrl} 
                alt={artworkTitle}
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* Right: Control Panel */}
        <div className="w-full md:w-80 bg-neutral-900 border-l border-white/10 p-8 flex flex-col gap-10 overflow-y-auto">
          
          <div>
            <h3 className="text-white text-lg font-light mb-4 tracking-wide">Print Width: <span className="font-mono text-neutral-400">{size}"</span></h3>
            <input 
              type="range" 
              min="16" 
              max="60" 
              step="2"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-full accent-white"
            />
            <div className="flex justify-between text-xs text-neutral-600 font-mono mt-2">
              <span>16"</span>
              <span>60"</span>
            </div>
          </div>

          <div>
            <h3 className="text-white text-lg font-light mb-4 tracking-wide">Wall Color</h3>
            <div className="flex flex-wrap gap-3">
              {colors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setWallColor(c.value)}
                  className={`px-4 py-2 rounded-sm text-xs uppercase tracking-widest font-mono transition-all ${
                    wallColor === c.value 
                    ? 'bg-white text-black' 
                    : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-8 border-t border-white/10">
            <p className="text-neutral-500 text-sm leading-relaxed mb-6">
              Use this tool to visualize how <span className="text-white">{artworkTitle}</span> will feel in your space. The scale is mathematically accurate relative to a standard 80-inch sofa.
            </p>
            <button 
              onClick={onClose}
              className="w-full py-4 bg-white text-black font-bold uppercase tracking-[0.2em] hover:bg-neutral-200 transition-colors"
            >
              Return to Gallery
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
