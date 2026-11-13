'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function WallPreviewStudio({
  imageUrl,
  artworkTitle,
  inquiryLink,
  onClose,
}) {
  const [size, setSize] = useState(40)
  const [frame, setFrame] = useState('black')
  const [wallColor, setWallColor] = useState('#ffffff')

  const FRAMES = [
    { name: 'Unframed Print', shortName: 'Unframed', id: 'none', style: '' },
    {
      name: 'Gallery Black',
      shortName: 'Black Frame',
      id: 'black',
      style: 'border-[3px] sm:border-[6px] md:border-[10px] border-[#151515] p-[2%] bg-[#fafafa]',
    },
    {
      name: 'Gallery White',
      shortName: 'White Frame',
      id: 'white',
      style: 'border-[3px] sm:border-[6px] md:border-[10px] border-[#f5f5f5] p-[2%] bg-white',
    },
    {
      name: 'Walnut Wood',
      shortName: 'Walnut Wood',
      id: 'walnut',
      style: 'border-[3px] sm:border-[6px] md:border-[10px] border-[#3e2723] p-[2%] bg-[#fdfbf7]',
    },
  ]

  const WALL_COLORS = [
    { name: 'Original', value: '#ffffff' },
    { name: 'Warm Ivory', value: '#f4f4f0' },
    { name: 'Sage Marsh', value: '#8b968a' },
    { name: 'Dusk Navy', value: '#1a293b' },
    { name: 'Charcoal', value: '#2a2a2a' },
  ]

  const QUICK_SIZES = [24, 30, 36, 40, 48, 60]

  // Lock body scroll and close on Escape
  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  const numericSize = Number(size) || 40
  const estimatedHeight = Math.round(numericSize * 0.67)
  const printWidthPercent = (numericSize / 120) * 100
  const activeFrame = FRAMES.find((f) => f.id === frame) || FRAMES[0]
  const activeWall = WALL_COLORS.find((c) => c.value === wallColor) || WALL_COLORS[0]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Interactive Room Visualizer — ${artworkTitle}`}
      className="fixed inset-0 z-[110] bg-neutral-950 flex flex-col w-full h-[100dvh] overflow-hidden select-none"
    >
      {/* Top Studio Header Bar */}
      <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 sm:px-5 sm:py-3.5 md:px-6 md:py-4 border-b border-white/10 bg-black shrink-0">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <p className="text-emerald-400/90 font-mono text-[9px] sm:text-[10px] md:text-xs uppercase tracking-[0.2em] truncate">
              Interactive Collector Room Studio
            </p>
          </div>
          <h2 className="text-sm sm:text-base md:text-xl text-white font-light tracking-wide truncate mt-0.5">
            {artworkTitle}
          </h2>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close Room Visualizer"
          className="shrink-0 min-h-[40px] sm:min-h-[44px] px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-neutral-900 hover:bg-neutral-800 active:scale-95 border border-white/25 text-white uppercase font-mono text-[10px] sm:text-xs tracking-widest transition-all flex items-center gap-1.5 shadow-lg cursor-pointer"
        >
          <span>Close</span>
          <span className="text-base sm:text-lg leading-none font-light">&times;</span>
        </button>
      </div>

      {/* Main Responsive Split Stage: Room Viewport + Collector Control Deck */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        {/* Room Preview Stage */}
        <div className="w-full md:flex-1 bg-neutral-950 flex items-center justify-center relative min-h-[34dvh] max-h-[48dvh] sm:max-h-[54dvh] md:max-h-none md:min-h-0 overflow-hidden p-2 sm:p-4 md:p-8 shrink-0">
          <div className="relative w-full max-w-5xl max-h-full flex items-center justify-center">
            <div className="relative w-full shadow-[0_20px_60px_rgba(0,0,0,0.9)] rounded-sm overflow-hidden border border-white/10">
              <img
                src="/room-preview.jpg"
                alt="Collector Living Room Scale Reference"
                draggable={false}
                className="w-full h-auto max-h-[44dvh] sm:max-h-[50dvh] md:max-h-[76dvh] object-contain block mx-auto"
              />

              {/* Wall Paint Color Tint Overlay */}
              <div
                className="absolute inset-0 pointer-events-none mix-blend-multiply transition-colors duration-500"
                style={{ backgroundColor: wallColor }}
              />

              {/* Top-Left Live Spec Badge */}
              <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-black/75 backdrop-blur-md border border-white/15 text-white/90 px-2.5 py-1 rounded text-[9px] sm:text-[10px] font-mono uppercase tracking-wider pointer-events-none z-10">
                {numericSize}&quot; &times; {estimatedHeight}&quot; • {activeFrame.shortName}
              </div>

              {/* Bottom Sofa Scale Reference Pill */}
              <div className="absolute bottom-2 md:bottom-5 left-1/2 -translate-x-1/2 bg-black/75 backdrop-blur-md border border-white/20 text-white/90 px-3 py-1 md:px-4 md:py-1.5 text-[9px] sm:text-[10px] font-mono tracking-widest uppercase rounded-full pointer-events-none z-10 whitespace-nowrap shadow-md">
                Reference Sofa: 80&quot; Wide
              </div>

              {/* Framed Artwork Positioned Above the Sofa */}
              <div
                className={`absolute transition-all duration-300 ease-out shadow-[0_12px_32px_rgba(0,0,0,0.85)] ${activeFrame.style}`}
                style={{
                  width: `${printWidthPercent}%`,
                  top: '37%',
                  left: '60%',
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <img
                  src={imageUrl}
                  alt={artworkTitle}
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                  className="w-full h-auto block shadow-inner select-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Collector Controls Panel (Compact & Thumb-Friendly on Mobile, Sidebar on Desktop) */}
        <div className="flex-1 md:w-80 lg:w-96 md:flex-none bg-neutral-900 border-t md:border-t-0 md:border-l border-white/10 px-4 py-3.5 sm:p-5 md:p-7 flex flex-col justify-between gap-3.5 sm:gap-5 md:gap-7 overflow-y-auto">
          <div className="space-y-3.5 sm:space-y-5 md:space-y-7">
            {/* 1. Print Width Slider & Quick Size Presets */}
            <div>
              <div className="flex items-baseline justify-between mb-1.5 sm:mb-2">
                <h3 className="text-white text-xs sm:text-sm md:text-base uppercase font-mono tracking-wider text-neutral-300">
                  1. Print Scale
                </h3>
                <span className="font-mono text-white text-sm sm:text-base font-semibold bg-black/60 border border-white/15 px-2.5 py-0.5 rounded">
                  {numericSize}&quot; W &times; ~{estimatedHeight}&quot; H
                </span>
              </div>

              <input
                type="range"
                min="16"
                max="60"
                step="2"
                value={numericSize}
                aria-label="Print Width in Inches"
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full accent-emerald-400 h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer my-1.5"
              />

              <div className="grid grid-cols-6 gap-1.5 mt-2">
                {QUICK_SIZES.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setSize(preset)}
                    className={`py-1.5 rounded text-[10px] sm:text-xs font-mono transition-colors cursor-pointer ${
                      numericSize === preset
                        ? 'bg-white text-black font-bold shadow'
                        : 'bg-black/60 text-neutral-400 hover:text-white border border-white/10'
                    }`}
                  >
                    {preset}&quot;
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Presentation / Framing */}
            <div>
              <h3 className="text-neutral-300 text-xs sm:text-sm md:text-base uppercase font-mono tracking-wider mb-2">
                2. Presentation Frame
              </h3>
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                {FRAMES.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFrame(f.id)}
                    className={`px-2.5 py-2 sm:py-2.5 rounded-sm text-center text-[10px] sm:text-xs tracking-wider uppercase font-mono transition-colors cursor-pointer ${
                      frame === f.id
                        ? 'bg-white text-black font-semibold shadow'
                        : 'bg-black/70 text-neutral-300 hover:text-white border border-white/10'
                    }`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Wall Paint Swatches */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-neutral-300 text-xs sm:text-sm md:text-base uppercase font-mono tracking-wider">
                  3. Wall Backdrop
                </h3>
                <span className="text-[10px] sm:text-xs font-mono text-neutral-400 uppercase tracking-wider">
                  {activeWall.name}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {WALL_COLORS.map((c) => {
                  const isSelected = wallColor === c.value
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setWallColor(c.value)}
                      title={c.name}
                      aria-label={`Wall color: ${c.name}`}
                      className={`flex flex-col items-center gap-1 p-1.5 rounded border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white/15 border-white text-white'
                          : 'bg-black/50 border-white/10 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <span
                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-white/30 shadow-inner shrink-0"
                        style={{ backgroundColor: c.value }}
                      />
                      <span className="text-[8px] sm:text-[9px] font-mono uppercase tracking-tighter truncate w-full text-center">
                        {c.name.split(' ')[0]}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Bottom Collector Action Bar inside Studio */}
          <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 pb-2">
            {inquiryLink && (
              <Link
                href={inquiryLink}
                scroll={false}
                onClick={onClose}
                className="w-full py-2.5 sm:py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-mono text-[11px] sm:text-xs font-bold uppercase tracking-widest text-center rounded-sm transition-colors shadow-md"
              >
                Inquire About {numericSize}&quot; {activeFrame.shortName}
              </Link>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 bg-black hover:bg-neutral-800 text-neutral-300 hover:text-white border border-white/15 font-mono text-[10px] sm:text-xs uppercase tracking-widest text-center rounded-sm transition-colors cursor-pointer"
            >
              Return to Photograph
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
