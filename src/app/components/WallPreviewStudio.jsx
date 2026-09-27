'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function WallPreviewStudio({ imageUrl, artworkTitle, onClose }) {
  const [size, setSize] = useState(40) // 16 to 60 inches
  const [frame, setFrame] = useState('none')
  const [wallColor, setWallColor] = useState('#ffffff') // default white

  const FRAMES = [
    { name: 'Unframed Print', id: 'none', style: '' },
    { name: 'Gallery Black', id: 'black', style: 'border-[8px] md:border-[16px] border-[#151515] p-[2%] bg-[#fafafa]' },
    { name: 'Gallery White', id: 'white', style: 'border-[8px] md:border-[16px] border-[#f5f5f5] p-[2%] bg-white' },
    { name: 'Walnut Wood', id: 'walnut', style: 'border-[8px] md:border-[16px] border-[#3e2723] p-[2%] bg-[#fdfbf7]' },
  ]

  const WALL_COLORS = [
    { name: 'Original', value: '#ffffff' },
    { name: 'Gallery White', value: '#f4f4f0' },
    { name: 'Charcoal', value: '#2a2a2a' },
    { name: 'Navy Blue', value: '#1a293b' },
    { name: 'Sage Green', value: '#8b968a' },
  ]

  // The 120 inch reference wall logic
  const printWidthPercent = (size / 120) * 100

  const activeFrame = FRAMES.find(f => f.id === frame)

  return (
    <div className="fixed inset-0 z-[100] bg-neutral-950 flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10 bg-black shrink-0">
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
        {/* Mobile: min-h-[50vh] ensures the room is visible and doesn't get collapsed by the control panel. */}
        <div className="w-full md:flex-1 bg-black flex items-center justify-center p-0 md:p-8 relative min-h-[50vh] md:min-h-0 overflow-hidden">
          {/* We use a container that perfectly wraps the image natively, avoiding aspect ratio cropping issues. */}
          <div className="relative w-full max-w-5xl shadow-2xl">
            {/* Native img tag so the container inherently matches the room photo aspect ratio exactly. */}
            <img 
              src="/room-preview.jpg" 
              alt="Luxury Living Room"
              className="w-full h-auto block"
            />
            
            {/* Wall Color Overlay */}
            <div 
              className="absolute inset-0 pointer-events-none mix-blend-multiply transition-colors duration-500"
              style={{ backgroundColor: wallColor }}
            />

            {/* Scale Label */}
            <div className="absolute bottom-2 md:bottom-6 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md border border-white/20 text-white/90 px-3 py-1 md:px-4 md:py-2 text-[8px] md:text-[10px] font-mono tracking-widest uppercase rounded-full pointer-events-none z-10 whitespace-nowrap">
              Reference Sofa: 80" Wide
            </div>

            {/* The Artwork Container */}
            {/* Changed from left: 50% to left: 63% to center perfectly over the sofa based on user feedback. top 38% lowers it closer to the sofa. */}
            <div 
              className={bsolute transition-all duration-500 ease-out shadow-[0_20px_50px_rgba(0,0,0,0.7)] }
              style={{ 
                width: ${printWidthPercent}%,
                top: '38%',
                left: '60%', 
                transform: 'translate(-50%, -50%)',
              }}
            >
              <img 
                src={imageUrl} 
                alt={artworkTitle}
                className="w-full h-auto block shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* Right: Control Panel */}
        {/* Mobile: h-[50vh] flex-shrink-0 so it perfectly splits the screen, and scrolls independently. */}
        <div className="w-full md:w-80 lg:w-96 h-[50vh] md:h-full shrink-0 bg-neutral-900 border-t md:border-t-0 md:border-l border-white/10 p-6 md:p-8 flex flex-col gap-6 md:gap-10 overflow-y-auto">
          
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
              onChange={(e) => setSize(e.target.value)}
              className="w-full accent-white h-1 bg-neutral-700 rounded-none appearance-none cursor-pointer"
            />
            <div className="flex justify-between mt-3 text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
              <span>Small (16")</span>
              <span>Massive (60")</span>
            </div>
          </div>

          {/* Frame Selection */}
          <div>
            <h3 className="text-white text-base md:text-lg font-light mb-4 tracking-wide">Presentation</h3>
            <div className="flex flex-col gap-2">
              {FRAMES.map(f => (
                <button
                  key={f.id}
                  onClick={() => setFrame(f.id)}
                  className={px-4 py-3 text-left text-xs tracking-widest uppercase font-mono transition-colors }
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>

          {/* Wall Color Selection */}
          <div className="pb-8">
            <h3 className="text-white text-base md:text-lg font-light mb-4 tracking-wide">Wall Paint</h3>
            <div className="grid grid-cols-2 gap-2">
              {WALL_COLORS.map(c => (
                <button
                  key={c.name}
                  onClick={() => setWallColor(c.value)}
                  className={px-3 py-3 text-center text-[10px] tracking-widest uppercase font-mono transition-colors }
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
