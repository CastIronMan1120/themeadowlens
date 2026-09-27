'use client'

import { useState } from 'react'

export default function WallPreviewStudio({ imageUrl, artworkTitle, onClose }) {
  const [size, setSize] = useState(40)
  const [frame, setFrame] = useState('none')
  const [wallColor, setWallColor] = useState('#ffffff')

  const FRAMES = [
    { name: 'Unframed Print', id: 'none', style: '' },
    { name: 'Gallery Black', id: 'black', style: 'border-[4px] md:border-[12px] border-[#151515] p-[2%] bg-[#fafafa]' },
    { name: 'Gallery White', id: 'white', style: 'border-[4px] md:border-[12px] border-[#f5f5f5] p-[2%] bg-white' },
    { name: 'Walnut Wood', id: 'walnut', style: 'border-[4px] md:border-[12px] border-[#3e2723] p-[2%] bg-[#fdfbf7]' },
  ]

  const WALL_COLORS = [
    { name: 'Original', value: '#ffffff' },
    { name: 'Gallery White', value: '#f4f4f0' },
    { name: 'Charcoal', value: '#2a2a2a' },
    { name: 'Navy Blue', value: '#1a293b' },
    { name: 'Sage Green', value: '#8b968a' },
  ]

  const printWidthPercent = (size / 120) * 100
  const activeFrame = FRAMES.find(f => f.id === frame)

  return (
    <div className="fixed inset-0 z-[100] bg-neutral-950 flex flex-col overflow-hidden">
      
      <div className="flex items-center justify-between p-3 md:p-6 border-b border-white/10 bg-black shrink-0">
        <div>
          <h2 className="text-base md:text-xl text-white font-light tracking-wide">{artworkTitle}</h2>
          <p className="text-neutral-500 font-mono text-[9px] md:text-xs uppercase tracking-widest mt-1">Interactive Wall Preview</p>
        </div>
        <button 
          onClick={onClose}
          className="text-neutral-400 hover:text-white uppercase font-mono text-[10px] md:text-sm tracking-widest transition-colors flex items-center gap-2"
        >
          <span className="hidden md:inline">Close Studio</span> 
          <span className="text-2xl font-light">&times;</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        <div className="w-full md:flex-1 bg-black flex items-center justify-center relative min-h-[45vh] md:min-h-0 overflow-hidden md:p-8">
          <div className="relative w-full max-w-5xl shadow-2xl">
            <img 
              src="/room-preview.jpg" 
              alt="Luxury Living Room"
              className="w-full h-auto block"
            />
            
            <div 
              className="absolute inset-0 pointer-events-none mix-blend-multiply transition-colors duration-500"
              style={{ backgroundColor: wallColor }}
            />

            <div className="absolute bottom-2 md:bottom-6 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md border border-white/20 text-white/90 px-3 py-1 md:px-4 md:py-2 text-[8px] md:text-[10px] font-mono tracking-widest uppercase rounded-full pointer-events-none z-10 whitespace-nowrap">
              Reference Sofa: 80" Wide
            </div>

            <div 
              className={`absolute transition-all duration-500 ease-out shadow-[0_10px_30px_rgba(0,0,0,0.8)] ${activeFrame.style}`}
              style={{ 
                width: `${printWidthPercent}%`,
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

        <div className="flex-1 md:w-80 lg:w-96 md:flex-none bg-neutral-900 border-t md:border-t-0 md:border-l border-white/10 p-4 md:p-8 flex flex-col gap-6 md:gap-10 overflow-y-auto">
          
          <div>
            <h3 className="text-white text-sm md:text-lg font-light mb-3 tracking-wide flex justify-between items-end">
              Print Width 
              <span className="font-mono text-white text-lg border-b border-white/30 pb-1">{size}"</span>
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
          </div>

          <div>
            <h3 className="text-white text-sm md:text-lg font-light mb-3 tracking-wide">Presentation</h3>
            <div className="flex flex-col gap-2">
              {FRAMES.map(f => (
                <button
                  key={f.id}
                  onClick={() => setFrame(f.id)}
                  className={`px-3 py-2 text-left text-[10px] md:text-xs tracking-widest uppercase font-mono transition-colors ${frame === f.id ? 'bg-white text-black font-semibold' : 'bg-black text-neutral-400 hover:text-white border border-white/5'}`}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>

          <div className="pb-8">
            <h3 className="text-white text-sm md:text-lg font-light mb-3 tracking-wide">Wall Paint</h3>
            <div className="grid grid-cols-2 gap-2">
              {WALL_COLORS.map(c => (
                <button
                  key={c.name}
                  onClick={() => setWallColor(c.value)}
                  className={`px-2 py-2 text-center text-[9px] md:text-[10px] tracking-widest uppercase font-mono transition-colors ${wallColor === c.value ? 'bg-white text-black font-semibold' : 'bg-black text-neutral-400 hover:text-white border border-white/5'}`}
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
