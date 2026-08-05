import { client } from '../sanity/lib/client'
import Gallery from './components/Gallery'

export const revalidate = 0 

export default async function Home() {
  const query = `*[_type == "artwork"] | order(_createdAt desc)`
  const artworks = await client.fetch(query)

  return (
    <main className="min-h-screen bg-black">
      
      {/* 1. THE CINEMATIC HERO ENTRANCE */}
      <section className="relative w-full h-[100svh] flex flex-col items-center justify-center overflow-hidden">
        
        {/* Background Moody Image (Using CSS for perfect cover) */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40 scale-105 animate-[slowZoom_20s_ease-in-out_infinite_alternate]"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=2560&auto=format&fit=crop')" }}
        ></div>

        {/* Editorial Mobile-First Typography */}
        <div className="relative z-10 text-center px-6">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-light tracking-tight text-white mb-6 uppercase" style={{ fontFamily: 'var(--font-geist-sans)' }}>
            The Meadow Lens
          </h1>
          <p className="text-xl md:text-2xl text-neutral-300 font-light tracking-[0.3em] uppercase">
            Naturally.
          </p>
        </div>

        {/* Scroll Trigger */}
        <a 
          href="#exhibition" 
          className="absolute bottom-12 z-10 flex flex-col items-center text-white/60 hover:text-white transition-colors group cursor-pointer"
        >
          <span className="text-xs uppercase tracking-[0.2em] mb-4 font-semibold">Enter Exhibition</span>
          <div className="w-[1px] h-12 bg-white/30 group-hover:bg-white transition-colors relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-white animate-[scrollDown_2s_ease-in-out_infinite]"></div>
          </div>
        </a>
      </section>

      {/* 2. THE EXHIBITION ROOMS GALLERY */}
      <section id="exhibition" className="min-h-screen p-4 sm:p-8 md:p-16 max-w-[2400px] mx-auto bg-neutral-950 relative z-20">
        
        <div className="max-w-3xl mx-auto text-center mb-24 mt-12">
          <h2 className="text-3xl md:text-4xl font-light text-white mb-6">The Curated Collection</h2>
          <p className="text-neutral-400 font-light leading-relaxed">
            Every piece is displayed in scale. Hover to examine the details. Click to inquire about acquisition.
          </p>
        </div>

        {artworks.length > 0 ? (
          <Gallery artworks={artworks} />
        ) : (
          <div className="text-center text-neutral-500 mt-24">
            <p>The gallery is currently empty.</p>
            <p className="text-sm mt-2">Upload your first artwork in the Sanity Dashboard to see it here.</p>
          </div>
        )}
      </section>
      
    </main>
  )
}
