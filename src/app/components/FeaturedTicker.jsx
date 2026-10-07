"use client"
import Link from 'next/link'

export default function FeaturedTicker({ artworks }) {
  if (!artworks || artworks.length === 0) return null

  // Duplicate the array so the CSS marquee can loop seamlessly
  const doubled = [...artworks, ...artworks, ...artworks]

  return (
    <div className="w-full bg-neutral-900 border-t border-b border-neutral-800 py-6 overflow-hidden relative z-30">
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-neutral-900 to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-neutral-900 to-transparent z-10" />
      
      <div className="flex animate-marquee whitespace-nowrap items-center space-x-6 w-max">
        {doubled.map((art, idx) => (
          <Link 
            href={`/art/${art.slug.current}`} 
            key={`${art._id}-${idx}`}
            className="group relative h-48 w-72 rounded-sm overflow-hidden flex-shrink-0 block"
          >
            <img 
              src={art.imageUrl} 
              alt={art.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors duration-500" />
            <div className="absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <p className="text-white text-sm truncate">{art.title}</p>
            </div>
          </Link>
        ))}
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-marquee {
          animation: marquee 60s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}
