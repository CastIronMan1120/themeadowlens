"use client"
import Link from 'next/link'

export default function FeaturedTicker({ artworks, speed = 120, reverse = false }) {
  if (!artworks || artworks.length === 0) return null

  const doubled = [...artworks, ...artworks, ...artworks]

  return (
    <div className="w-full border-t border-b border-neutral-800 py-4 sm:py-6 overflow-hidden relative z-30">
      <div className="absolute left-0 top-0 bottom-0 w-10 sm:w-24 bg-gradient-to-r from-neutral-900 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-10 sm:w-24 bg-gradient-to-l from-neutral-900 to-transparent z-10 pointer-events-none" />
      
      <div 
        className="flex animate-marquee whitespace-nowrap items-center space-x-4 sm:space-x-6 w-max"
        style={{ animation: `marquee ${speed}s linear infinite ${reverse ? 'reverse' : 'normal'}` }}
      >
        {doubled.map((art, idx) => (
          <Link 
            href={`/art/${art.slug.current}`} 
            key={`${art._id}-${idx}`}
            className="group relative h-36 w-56 sm:h-48 sm:w-72 rounded-sm overflow-hidden flex-shrink-0 block"
          >
            <img 
              src={art.imageUrl} 
              alt={art.displayTitle || art.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
            <div className="absolute bottom-0 left-0 w-full p-2.5 sm:p-3 bg-gradient-to-t from-black/85 to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
              <p className="text-white text-xs sm:text-sm truncate">{art.displayTitle || art.title}</p>
            </div>
          </Link>
        ))}
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-marquee:hover {
          animation-play-state: paused !important;
        }
      `}</style>
    </div>
  )
}
