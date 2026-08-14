'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Navigation({ categories = [] }) {
  const [scrolled, setScrolled] = useState(false)
  const [megaMenuOpen, setMegaMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Hardcoded fallback categories until Sanity is populated
  const displayCategories = categories.length > 0 ? categories : [
    { _id: '1', title: 'Birds', slug: { current: 'birds' } },
    { _id: '2', title: 'Cityscape', slug: { current: 'cityscape' } },
    { _id: '3', title: 'Reptiles', slug: { current: 'reptiles' } },
    { _id: '4', title: 'Insects', slug: { current: 'insects' } },
    { _id: '5', title: 'Plants', slug: { current: 'plants' } },
    { _id: '6', title: 'Mammals', slug: { current: 'mammals' } },
    { _id: '7', title: 'Moon & Stars', slug: { current: 'moon-stars' } },
    { _id: '8', title: 'Collages', slug: { current: 'collages' } },
    { _id: '9', title: 'Fun with Captions', slug: { current: 'fun-with-captions' } },
    { _id: '10', title: 'Planes, Trains & Automobiles', slug: { current: 'planes-trains-automobiles' } },
    { _id: '11', title: 'Landscapes', slug: { current: 'landscapes' } },
    { _id: '12', title: 'Other', slug: { current: 'other' } }
  ]

  // Sort categories: Birds first, then alphabetical
  const sortedCategories = [...displayCategories].sort((a, b) => {
    if (a.title.toLowerCase() === 'birds') return -1
    if (b.title.toLowerCase() === 'birds') return 1
    return a.title.localeCompare(b.title)
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
            className="text-2xl md:text-3xl font-normal tracking-wide text-white transition-opacity hover:opacity-80" 
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
                className={`absolute top-full left-1/2 -translate-x-1/2 w-[800px] pt-8 transition-all duration-500 origin-top ${
                  megaMenuOpen ? 'opacity-100 scale-y-100 pointer-events-auto' : 'opacity-0 scale-y-95 pointer-events-none'
                }`}
              >
                <div className="bg-black/95 backdrop-blur-3xl border border-white/10 rounded-sm shadow-2xl p-12 flex flex-col">
                  <h2 className="text-neutral-500 text-sm tracking-[0.3em] uppercase mb-8 border-b border-white/10 pb-4">
                    Explore Venues
                  </h2>
                  <div className="grid grid-cols-3 gap-x-12 gap-y-6">
                    {sortedCategories.map(cat => (
                      <Link 
                        key={cat._id}
                        href={`/category/${cat.slug?.current}`} 
                        className="text-neutral-300 hover:text-white transition-colors font-light text-lg"
                      >
                        {cat.title}
                      </Link>
                    ))}
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
            <a href="mailto:dmc1120@themeadowlens.com" className="text-white uppercase tracking-widest text-xs font-semibold hover:text-neutral-400 transition-colors">
              Inquiries & Comments
            </a>

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
          <Link href="/" className="text-2xl text-white" style={{ fontFamily: 'var(--font-logo)' }}>The Meadow Lens</Link>
          <button onClick={() => setMobileMenuOpen(false)} className="text-white/50 hover:text-white text-3xl font-light">&times;</button>
        </div>

        <nav className="flex flex-col space-y-8">
          <div className="flex flex-col space-y-6 border-b border-white/10 pb-8">
            <h2 className="text-neutral-500 text-xs tracking-[0.3em] uppercase">Venues</h2>
            <div className="grid grid-cols-2 gap-4">
              {sortedCategories.map(cat => (
                <Link key={cat._id} href={`/category/${cat.slug?.current}`} onClick={() => setMobileMenuOpen(false)} className="text-lg font-light text-neutral-300">
                  {cat.title}
                </Link>
              ))}
            </div>
          </div>
          
          <Link href="/artist" onClick={() => setMobileMenuOpen(false)} className="text-3xl font-light text-white/80">The Artist</Link>
          <Link href="/news" onClick={() => setMobileMenuOpen(false)} className="text-3xl font-light text-white/80">What's New</Link>
          <a href="mailto:dmc1120@themeadowlens.com" className="text-3xl font-light text-white/80">Inquiries & Comments</a>
          
          <div className="pt-8 flex space-x-8 border-t border-white/10">
            <a href="https://www.facebook.com/themeadowlens/" target="_blank" rel="noopener noreferrer" className="text-white/50 uppercase tracking-widest text-xs font-mono">Facebook</a>
            <a href="https://www.instagram.com/themeadowlens/" target="_blank" rel="noopener noreferrer" className="text-white/50 uppercase tracking-widest text-xs font-mono">Instagram</a>
          </div>
        </nav>
      </div>
    </>
  )
}
