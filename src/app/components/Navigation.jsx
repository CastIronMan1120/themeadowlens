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
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-black/95 backdrop-blur-xl py-2.5 md:py-3.5 shadow-[0_8px_30px_rgba(0,0,0,0.7)]'
            : 'bg-black/90 backdrop-blur-md py-3.5 sm:py-4 md:py-5'
        }`}
      >
        <div className="max-w-[2000px] mx-auto px-4 sm:px-6 md:px-12 flex items-center justify-between gap-4">
          
          {/* Logo & Slogan */}
          <Link href="/" className="group flex flex-col relative z-50 min-w-0 flex-1 pr-2">
            <h1 
              className="text-[26px] xs:text-[30px] sm:text-4xl md:text-[48px] xl:text-[58px] leading-none whitespace-nowrap text-white tracking-normal font-normal drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] transition-all duration-500 group-hover:opacity-85"
              style={{ fontFamily: 'var(--font-logo)' }}
            >
              The Meadow Lens
            </h1>
            <p className="text-neutral-300 font-mono text-[9px] sm:text-[10px] md:text-xs uppercase tracking-wider sm:tracking-widest mt-1.5 sm:mt-2 drop-shadow-md max-w-full lg:max-w-2xl xl:max-w-none leading-snug">
              &ldquo;Wow-factor&rdquo; photography of birds, nature and more with particular focus on the NJ &ldquo;Meadowlands&rdquo; !
            </p>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6 xl:space-x-9 shrink-0">
            
            <Link href="/" className="text-white uppercase tracking-widest text-xs font-semibold hover:text-neutral-400 transition-colors">
              HOME
            </Link>

            <Link href="/bird-index" className="text-white uppercase tracking-widest text-xs font-semibold hover:text-neutral-400 transition-colors">
              Species Index
            </Link>

            <Link href="/category/guest-photos" className="text-white uppercase tracking-widest text-xs font-semibold hover:text-neutral-400 transition-colors">
              Guest Photos
            </Link>

            <Link href="/artist" className="text-white uppercase tracking-widest text-xs font-semibold hover:text-neutral-400 transition-colors">
              The Artist
            </Link>

            <Link href="/news" className="text-white uppercase tracking-widest text-xs font-semibold hover:text-neutral-400 transition-colors">
              What&apos;s New
            </Link>

            <Link href="?inquire=true" scroll={false} className="text-white uppercase tracking-widest text-xs font-semibold hover:text-neutral-400 transition-colors">
              Inquiries &amp; Comments
            </Link>

          </div>

          {/* Mobile Hamburger Trigger */}
          <button 
            type="button"
            aria-label="Open Navigation Menu"
            className="lg:hidden shrink-0 mt-1 sm:mt-0 px-3.5 py-2 rounded-full bg-black/70 border border-white/20 text-white uppercase tracking-widest text-[11px] font-mono font-semibold drop-shadow-md z-50 flex items-center gap-2 active:scale-95 transition-transform"
            onClick={() => setMobileMenuOpen(true)}
          >
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span>Menu</span>
          </button>
        </div>
      </nav>

      {/* --- MOBILE FULL-SCREEN OVERLAY --- */}
      <div 
        className={`fixed inset-0 z-[60] bg-black/95 backdrop-blur-2xl transition-all duration-500 flex flex-col p-6 sm:p-8 overflow-y-auto lg:hidden ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex justify-between items-center mb-10 pb-4 border-b border-white/10">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="text-3xl sm:text-4xl text-white drop-shadow-md whitespace-nowrap"
            style={{ fontFamily: 'var(--font-logo)' }}
          >
            The Meadow Lens
          </Link>
          <button
            type="button"
            aria-label="Close Navigation Menu"
            onClick={() => setMobileMenuOpen(false)}
            className="w-10 h-10 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white text-2xl font-light"
          >
            &times;
          </button>
        </div>

        <nav className="flex flex-col space-y-5 sm:space-y-6">
          <Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-2xl sm:text-3xl font-light text-white hover:text-emerald-300 transition-colors">
            Home
          </Link>
          <Link href="/#venues" onClick={() => setMobileMenuOpen(false)} className="text-2xl sm:text-3xl font-light text-white/85 hover:text-white transition-colors">
            Explore The Venues
          </Link>
          <Link href="/bird-index" onClick={() => setMobileMenuOpen(false)} className="text-2xl sm:text-3xl font-light text-white/85 hover:text-white transition-colors">
            Species Index (A–Z)
          </Link>
          <Link href="/category/guest-photos" onClick={() => setMobileMenuOpen(false)} className="text-2xl sm:text-3xl font-light text-emerald-300 hover:text-white transition-colors">
            Guest Photos
          </Link>
          <Link href="/artist" onClick={() => setMobileMenuOpen(false)} className="text-2xl sm:text-3xl font-light text-white/85 hover:text-white transition-colors">
            The Artist
          </Link>
          <Link href="/news" onClick={() => setMobileMenuOpen(false)} className="text-2xl sm:text-3xl font-light text-white/85 hover:text-white transition-colors">
            What&apos;s New
          </Link>
          <Link href="/sitemap" onClick={() => setMobileMenuOpen(false)} className="text-2xl sm:text-3xl font-light text-white/85 hover:text-white transition-colors">
            Site Directory
          </Link>
          <Link href="?inquire=true" scroll={false} onClick={() => setMobileMenuOpen(false)} className="text-2xl sm:text-3xl font-light text-white/85 hover:text-white transition-colors">
            Inquiries &amp; Comments
          </Link>
          
          <div className="pt-6 mt-4 flex items-center space-x-8 border-t border-white/10">
            <a href="https://www.facebook.com/themeadowlens/" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white uppercase tracking-widest text-xs font-mono">Facebook</a>
            <a href="https://www.instagram.com/themeadowlens/" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white uppercase tracking-widest text-xs font-mono">Instagram</a>
          </div>
        </nav>
      </div>
    </>
  )
}


