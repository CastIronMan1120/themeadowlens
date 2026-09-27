'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Navigation({ categories = [] }) {
  const [scrolled, setScrolled] = useState(false)
  const [megaMenuOpen, setMegaMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [hoveredCategory, setHoveredCategory] = useState(null)

  const displayCategories = categories.length > 0 ? categories : [
    { _id: '1', title: 'Birds', slug: { current: 'birds' } },
    { _id: '2', title: 'Fauna', slug: { current: 'fauna' } },
    { _id: '3', title: 'Flora', slug: { current: 'flora' } },
    { _id: '4', title: 'Sky & Heavens', slug: { current: 'sky-heavens' } },
    { _id: '5', title: 'Vistas, Landscapes and Scenes', slug: { current: 'vistas-scenery' } },
    { _id: '6', title: 'Captioned Works', slug: { current: 'captioned-works' } },
    { _id: '7', title: 'Compilations', slug: { current: 'compilations' } },
    { _id: '8', title: 'Air Traffic & Steel Rails', slug: { current: 'air-traffic-steel-rails' } },
    { _id: '9', title: 'Everything', slug: { current: 'everything' } },
    { _id: '10', title: 'Guest Photos', slug: { current: 'guest-photos' } },
    { _id: '11', title: 'Video', slug: { current: 'video' } }
  ]
  // Enforce the strict Master Branding Order from the /learn rules
  const VENUE_ORDER = [
    'Birds',
    'Fauna',
    'Flora',
    'Sky & Heavens',
    'Vistas, Landscapes and Scenes',
    'Captioned Works',
    'Compilations',
    'Air Traffic & Steel Rails',
    'Everything',
    'Guest Photos',
    'Video'
  ]

  const sortedCategories = [...displayCategories].sort((a, b) => {
    const indexA = VENUE_ORDER.indexOf(a.title)
    const indexB = VENUE_ORDER.indexOf(b.title)
    // If a category isn't in the explicit order list, push it to the end
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  })


  useEffect(() => {
    let lastScrollY = window.scrollY
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
      lastScrollY = window.scrollY
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Exotic Color Mapping for the Mega Menu Gradient Wash
  const VENUE_COLORS = {
    'Birds': 'from-red-900/60',
    'Fauna': 'from-amber-900/50',
    'Flora': 'from-emerald-900/50',
    'Sky & Heavens': 'from-sky-900/50',
    'Vistas, Landscapes and Scenes': 'from-purple-900/50',
    'Captioned Works': 'from-neutral-800/50',
    'Compilations': 'from-indigo-900/50',
    'Air Traffic & Steel Rails': 'from-orange-900/40',
    'Everything': 'from-white/10',
    'Guest Photos': 'from-pink-900/40',
    'Video': 'from-cyan-900/50'
  }

  const activeColor = hoveredCategory ? VENUE_COLORS[hoveredCategory.title] || 'from-black/0' : 'from-black/0'

  return (
    <>
      {/* --- DESKTOP MEGA MENU NAVIGATION --- */}
      <nav 
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          scrolled || megaMenuOpen ? 'bg-black/95 backdrop-blur-xl border-b border-white/10 py-6' : 'bg-transparent py-8'
        }`}
      >
        <div className="max-w-[2400px] mx-auto px-8 flex justify-between items-center">
          
          {/* Brand Logo */}
          <Link 
            href="/" 
            className="text-4xl md:text-5xl lg:text-6xl font-normal tracking-wider text-white transition-opacity hover:opacity-80 drop-shadow-md" 
            style={{ fontFamily: 'var(--font-logo)' }}
          >
            The Meadow Lens
          </Link>
          
          {/* Desktop Links */}
          <div className="hidden lg:flex items-center space-x-12">
            
            {/* The Venues Trigger */}
            <div 
              className="relative h-full flex items-center py-2"
              onMouseEnter={() => setMegaMenuOpen(true)}
              onMouseLeave={() => setMegaMenuOpen(false)}
            >
              <button className="text-white uppercase tracking-widest text-xs font-semibold hover:text-neutral-400 transition-colors cursor-default">
                Venues <span className="ml-1 opacity-50">▾</span>
              </button>

              {/* The Dropdown Panel */}
              <div 
                className={`absolute top-full left-1/2 -translate-x-1/2 w-[1100px] pt-8 transition-all duration-500 origin-top ${
                  megaMenuOpen ? 'opacity-100 scale-y-100 pointer-events-auto' : 'opacity-0 scale-y-95 pointer-events-none'
                }`}
              >
                <div className={`bg-black/95 backdrop-blur-3xl border border-white/10 rounded-sm shadow-2xl overflow-hidden flex bg-gradient-to-br to-black/90 transition-colors duration-700 ${activeColor}`}>
                  
                  {/* Featured Column with Ken Burns Effect */}
                  <div className="w-1/3 relative hidden md:block group/feature cursor-pointer overflow-hidden bg-black">
                    <div 
                      className="absolute inset-0 bg-cover bg-center transition-all duration-[2000ms] ease-out group-hover/feature:scale-110 opacity-40 group-hover/feature:opacity-70" 
                      style={{ backgroundImage: `url('${hoveredCategory?.menuImageUrl || "https://images.unsplash.com/photo-1555621458-1c4b81c2f94c?q=80&w=800&auto=format&fit=crop"}')` }}
                    ></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-8 transition-all duration-700 transform translate-y-4 group-hover/feature:translate-y-0">
                      <p className="text-neutral-400 text-xs tracking-[0.3em] uppercase mb-2 opacity-0 group-hover/feature:opacity-100 transition-opacity duration-700 delay-100">
                        {hoveredCategory ? "Explore Venue" : "Featured Exhibition"}
                      </p>
                      <h3 className="text-white text-3xl font-light tracking-wide shadow-black drop-shadow-2xl">
                        {hoveredCategory ? hoveredCategory.title : "Great Blue Heron"}
                      </h3>
                    </div>
                  </div>

                  {/* Venues Column */}
                  <div className="flex-1 p-12">
                    <h2 className="text-neutral-500 text-sm tracking-[0.3em] uppercase mb-8 border-b border-white/10 pb-4">
                      Explore Venues
                    </h2>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                      {sortedCategories.map((category, index) => (
                        <Link 
                          key={category._id}
                          href={`/category/${category.slug.current}`} 
                          className="group relative inline-block text-lg md:text-xl font-light transition-all uppercase tracking-widest font-mono text-neutral-400 hover:text-white"
                          style={{
                            opacity: megaMenuOpen ? 1 : 0,
                            transform: megaMenuOpen ? 'translateY(0)' : 'translateY(10px)',
                            transition: `all 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${0.1 + (index * 0.05)}s`
                          }}
                          onClick={() => setMegaMenuOpen(false)}
                          onMouseEnter={() => setHoveredCategory(category)}
                          onMouseLeave={() => setHoveredCategory(null)}
                        >
                          <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-2 inline-block">
                            {category.title}
                          </span>
                          {/* Glowing Underline Bell & Whistle */}
                          <span className="absolute left-0 -bottom-1 w-0 h-[1px] bg-white/50 transition-all duration-500 group-hover:w-full group-hover:bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"></span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Connect Column */}
                  <div className="w-1/4 bg-neutral-900/50 p-12 border-l border-white/5">
                    <h2 className="text-neutral-500 text-sm tracking-[0.3em] uppercase mb-8 border-b border-white/10 pb-4">
                      Connect
                    </h2>
                    <div className="flex flex-col space-y-6">
                      <a href="https://www.facebook.com/themeadowlens/" target="_blank" rel="noopener noreferrer" className="text-neutral-300 hover:text-white transition-colors text-sm uppercase tracking-widest font-mono flex items-center group/social">
                        <span className="mr-3 text-neutral-500 group-hover/social:text-white transition-colors">fb</span> Facebook
                      </a>
                      <a href="https://www.instagram.com/themeadowlens/" target="_blank" rel="noopener noreferrer" className="text-neutral-300 hover:text-white transition-colors text-sm uppercase tracking-widest font-mono flex items-center group/social">
                        <span className="mr-3 text-neutral-500 group-hover/social:text-white transition-colors">ig</span> Instagram
                      </a>
                      <Link href="?inquire=true" scroll={false} className="text-neutral-300 hover:text-white transition-colors text-sm uppercase tracking-widest font-mono flex items-center group/social pt-4 border-t border-white/10">
                        <span className="mr-3 text-neutral-500 group-hover/social:text-white transition-colors">✉</span> Email
                      </Link>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Other Static Links */}
            <Link href="/artist" className="text-white uppercase tracking-widest text-xs font-semibold hover:text-neutral-400 transition-colors">
              The Artist
            </Link>
            <Link href="/news" className="text-white uppercase tracking-widest text-xs font-semibold hover:text-neutral-400 transition-colors">
              What's New
            </Link>
            <Link href="?inquire=true" scroll={false} className="text-white uppercase tracking-widest text-xs font-semibold hover:text-neutral-400 transition-colors">
              Inquiries & Comments
            </Link>

          </div>

          {/* Mobile Hamburger Trigger */}
          <button 
            className="lg:hidden text-white uppercase tracking-widest text-xs font-semibold"
            onClick={() => setMobileMenuOpen(true)}
          >
            Menu
          </button>
        </div>
      </nav>

      {/* --- MOBILE FULL-SCREEN OVERLAY (Fallback for phones) --- */}
      <div 
        className={`fixed inset-0 z-[60] bg-black/95 backdrop-blur-2xl transition-all duration-700 flex flex-col p-8 overflow-y-auto lg:hidden ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex justify-between items-center mb-16">
          <Link href="/" className="text-4xl text-white drop-shadow-md" style={{ fontFamily: 'var(--font-logo)' }}>The Meadow Lens</Link>
          <button onClick={() => setMobileMenuOpen(false)} className="text-white/50 hover:text-white text-3xl font-light">&times;</button>
        </div>

        <nav className="flex flex-col space-y-8">
          <div className="flex flex-col space-y-6 border-b border-white/10 pb-8">
            <h2 className="text-neutral-500 text-xs tracking-[0.3em] uppercase">Venues</h2>
            <div className="grid grid-cols-2 gap-4">
              {sortedCategories.map(cat => (
                <Link key={cat._id} href={`/category/${cat.slug.current}`} onClick={() => setMobileMenuOpen(false)} className="text-lg font-light text-neutral-300">
                  {cat.title}
                </Link>
              ))}
            </div>
          </div>
          
          <Link href="/artist" onClick={() => setMobileMenuOpen(false)} className="text-3xl font-light text-white/80">The Artist</Link>
          <Link href="/news" onClick={() => setMobileMenuOpen(false)} className="text-3xl font-light text-white/80">What's New</Link>
          <Link href="?inquire=true" scroll={false} className="text-3xl font-light text-white/80">Inquiries & Comments</Link>
          
          <div className="pt-8 flex space-x-8 border-t border-white/10">
            <a href="https://www.facebook.com/themeadowlens/" target="_blank" rel="noopener noreferrer" className="text-white/50 uppercase tracking-widest text-xs font-mono">Facebook</a>
            <a href="https://www.instagram.com/themeadowlens/" target="_blank" rel="noopener noreferrer" className="text-white/50 uppercase tracking-widest text-xs font-mono">Instagram</a>
          </div>
        </nav>
      </div>
    </>
  )
}
