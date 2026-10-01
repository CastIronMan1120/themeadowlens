'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navigation({ categories }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  // Detect scroll for dynamic header background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  return (
    <>
      <nav 
        className={`fixed w-full z-50 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          scrolled ? 'bg-black/80 backdrop-blur-xl border-b border-white/5 py-4' : 'bg-transparent py-8 md:py-12'
        }`}
      >
        <div className="max-w-[2000px] mx-auto px-6 md:px-12 flex items-center justify-between">
          
          {/* Logo & Slogan */}
          <Link href="/" className="group flex flex-col relative z-50">
            <h1 
              className="text-5xl md:text-[80px] text-white tracking-normal font-normal drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] transition-all duration-700 group-hover:opacity-80"
              style={{ fontFamily: 'var(--font-logo)' }}
            >
              The Meadow Lens
            </h1>
            <p className="text-white/80 font-mono text-[9px] md:text-[11px] uppercase tracking-widest mt-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] max-w-sm md:max-w-3xl leading-relaxed">
              "Wow-factor" photography of birds, nature and more with particular focus on the NJ "Meadowlands" !
            </p>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-12">
            
            <Link href="/" className="text-white uppercase tracking-widest text-xs font-semibold hover:text-neutral-400 transition-colors">
              Venues
            </Link>

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
            className="lg:hidden text-white uppercase tracking-widest text-xs font-semibold drop-shadow-md z-50"
            onClick={() => setMobileMenuOpen(true)}
          >
            Menu
          </button>
        </div>
      </nav>

      {/* --- MOBILE FULL-SCREEN OVERLAY --- */}
      <div 
        className={`fixed inset-0 z-[60] bg-black/95 backdrop-blur-2xl transition-all duration-700 flex flex-col p-8 overflow-y-auto lg:hidden ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex justify-between items-start mb-16">
          <div className="flex flex-col">
            <Link href="/" className="text-5xl text-white drop-shadow-md" style={{ fontFamily: 'var(--font-logo)' }}>The Meadow Lens</Link>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="text-white/50 hover:text-white text-3xl font-light">&times;</button>
        </div>

        <nav className="flex flex-col space-y-8">
          <Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-3xl font-light text-white/80">Venues</Link>
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
