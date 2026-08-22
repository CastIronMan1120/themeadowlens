'use client'

import { useState } from 'react'
import Link from 'next/link'

const ROOM_TEMPLATES = {
  'living-room': {
    name: 'Modern Living Room',
    url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=2000&auto=format&fit=crop'
  },
  'dark-gallery': {
    name: 'Dark Gallery Wall',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2000&auto=format&fit=crop'
  },
  'office': {
    name: 'Minimalist Office',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000&auto=format&fit=crop'
  }
}

export default function RoomSettingViewer({ artworkUrl, title, returnPath }) {
  const [activeRoom, setActiveRoom] = useState('living-room')

  return (
    <div className="flex flex-col space-y-8 w-full">
      {/* The Interactive Room Canvas */}
      <div className="relative w-full aspect-[4/3] md:aspect-video bg-neutral-900 overflow-hidden shadow-2xl rounded-sm">
        
        {/* Background Room */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out opacity-80"
          style={{ backgroundImage: `url('${ROOM_TEMPLATES[activeRoom].url}')` }}
        ></div>

        {/* Lighting Overlay */}
        <div className="absolute inset-0 bg-black/30 pointer-events-none"></div>

        {/* The Composited Artwork */}
        <div className="absolute inset-0 flex items-center justify-center p-12 md:p-24 pointer-events-none">
          <img
            src={artworkUrl}
            alt={title}
            className="max-w-full max-h-full object-contain shadow-[0_30px_60px_rgba(0,0,0,0.8)] transition-transform duration-1000 scale-[1.05]"
          />
        </div>
        
      </div>

      {/* Room Selection Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-neutral-900/50 p-6 border border-white/10 rounded-sm">
        <div className="flex space-x-4 mb-4 md:mb-0">
          {Object.entries(ROOM_TEMPLATES).map(([key, room]) => (
            <button
              key={key}
              onClick={() => setActiveRoom(key)}
              className={`px-4 py-2 text-xs uppercase tracking-widest font-mono transition-colors ${
                activeRoom === key 
                  ? 'bg-white text-black font-bold' 
                  : 'text-neutral-400 border border-neutral-700 hover:border-white hover:text-white'
              }`}
            >
              {room.name}
            </button>
          ))}
        </div>

        <Link 
          href={returnPath}
          className="text-neutral-400 hover:text-white text-xs uppercase font-mono tracking-widest transition-colors border-b border-neutral-700 hover:border-white pb-1"
        >
          Exit Room View
        </Link>
      </div>
    </div>
  )
}
