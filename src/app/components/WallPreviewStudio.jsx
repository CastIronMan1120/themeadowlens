'use client'
import { useState } from 'react'
import Image from 'next/image'

export default function WallPreviewStudio({ imageUrl, artworkTitle, onClose }) {
  const [size, setSize] = useState(36) // default 36 inches wide
  const [wallColor, setWallColor] = useState('transparent')
  const [frame, setFrame] = useState('none')

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

  const frames = [
    { name: 'Unframed Print', id: 'none', style: '' },
    { name: 'Gallery Black', id: 'black', style: 'border-[8px] md:border-[16px] border-[#151515] p-[2%] bg-[#fafafa]' },
    { name: 'Gallery White', id: 'white', style: 'border-[8px] md:border-[16px] border-[#f5f5f5] p-[2%] bg-white' },
    { name: 'Walnut Wood', id: 'walnut', style: 'border-[8px] md:border-[16px] border-[#3e2723] p-[2%] bg-[#fdfbf7]' },
  ]

  const activeFrame = frames.find(f => f.id === frame)

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950 flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10 bg-black">
        <div>
          <h2 className="text-lg md:text-xl text-white font-light tracking-wide">{artworkTitle}</h2>
          <p className="text-neutral-500 font-mono text-[10px] md:text-xs uppercase tracking-widest mt-1">Interactive Wall Preview</p>
        </div>
        <button 
          onClick={onClose}
          className="text-neutral-400 hover:text-white uppercase font-mono text-[10px] md:text-sm tracking-widest transition-colors flex items-center gap-2"
        >
          <span>Close Studio</span> 
          <span className="text-xl font-light">&times;</span>
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

            {/* Scale Label for Clarity */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md border border-white/20 text-white/70 px-4 py-2 text-[10px] font-mono tracking-widest uppercase rounded-full pointer-events-none">
              Reference Sofa: 80" Wide
            </div>

            {/* The Artwork Container */}
            {/* Top 32% aligns beautifully over the couch in our specific source image. */}
            <div 
              className={`absolute left-1/2 -translate-x-1/2 transition-all duration-500 ease-out shadow-[0_20px_50px_rgba(0,0,0,0.5)] ${activeFrame.style}`}
              style={{ 
                width: `${printWidthPercent}%`,
                top: '32%',
                transform: 'translate(-50%, -50%)',
                // We REMOVED the hardcoded 3/2 aspect ratio here.
                // The image will now determine its own height logically based on the width.
              }}
            >
              {/* Native img tag used here so it dynamically scales its height relative to its natural width, maintaining perfect aspect ratio of the actual uploaded photograph. */}
              <img 
                src={imageUrl} 
                alt={artworkTitle}
                className="w-full h-auto block shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* Right: Control Panel */}
        <div className="w-full md:w-80 lg:w-96 bg-neutral-900 border-l border-white/10 p-6 md:p-8 flex flex-col gap-8 md:gap-10 overflow-y-auto">
          
          {/* Size Logic */}
          <div>
            <h3 className="text-white text-base md:text-lg font-light mb-4 tracking-wide flex justify-between items-end">
              Print Width 
              <span className="font-mono text-white text-xl border-b border-white/30 pb-1">{size}"</span>
            </h3>
            <input 
              type="range" 
              min="16" 
              max="60" 
              step="2"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-full accent-white cursor-ew-resize"
            />
            <div className="flex justify-between text-[10px] text-neutral-600 font-mono mt-2 uppercase tracking-widest">
              <span>Small (16")</span>
              <span>Massive (60")</span>
            </div>
          </div>

          {/* Frame Logic */}
          <div>
            <h3 className="text-white text-base md:text-lg font-light mb-4 tracking-wide">Presentation</h3>
            <div className="flex flex-col gap-2">
              {frames.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFrame(f.id)}
                  className={`w-full text-left px-4 py-3 rounded-sm text-[10px] md:text-xs uppercase tracking-widest font-mono transition-all border ${
                    frame === f.id 
                    ? 'border-white bg-white text-black' 
                    : 'border-white/10 bg-neutral-950 text-neutral-400 hover:border-white/30 hover:text-white'
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>

          {/* Color Logic */}
          <div>
            <h3 className="text-white text-base md:text-lg font-light mb-4 tracking-wide">Wall Paint</h3>
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setWallColor(c.value)}
                  className={`px-3 py-2 rounded-sm text-[10px] uppercase tracking-widest font-mono transition-all border ${
                    wallColor === c.value 
                    ? 'border-white bg-white text-black' 
                    : 'border-transparent bg-neutral-950 text-neutral-400 hover:border-white/30 hover:text-white'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Action */}
          <div className="mt-auto pt-8 border-t border-white/10">
            <p className="text-neutral-500 text-[10px] md:text-xs leading-relaxed mb-6 font-light">
              Scale is calculated using a standard 80-inch sofa. The photograph's height scales logically based on its native aspect ratio.
            </p>
            <button 
              onClick={onClose}
              className="w-full py-4 bg-white text-black font-bold uppercase tracking-[0.2em] text-xs hover:bg-neutral-200 transition-colors"
            >
              Confirm & Return
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
