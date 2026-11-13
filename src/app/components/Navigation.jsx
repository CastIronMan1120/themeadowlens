'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navigation({ categories }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  // Detect scroll with hysteresis so header never oscillates or shakes near the threshold
  useEffect(() => {
    let rafId = null
    const handleScroll = () => {
      if (rafId !== null) return
      rafId = window.requestAnimationFrame(() => {
        const y = window.scrollY
        setScrolled((prev) => {
          if (!prev && y > 80) return true
          if (prev && y < 20) return false
          return prev
        })
        rafId = null
      })
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafId !== null) window.cancelAnimationFrame(rafId)
    }
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  return (
    <>
      {/* Constant-height layout spacer prevents fixed header compacting from ever altering window.scrollY */}
      <header className="h-[136px] sm:h-[144px] md:h-[154px] w-full max-w-[100vw] overflow-x-hidden shrink-0 bg-black">
        <nav 
          className={`fixed top-0 left-0 right-0 w-full max-w-[100vw] overflow-x-hidden z-50 transition-[background-color,padding,box-shadow] duration-300 ${
            scrolled
              ? 'bg-black/95 backdrop-blur-xl py-2 md:py-2.5 shadow-[0_8px_30px_rgba(0,0,0,0.7)]'
              : 'bg-black pt-2.5 sm:pt-3.5 md:pt-4 pb-2'
          }`}
        >
          <div className="w-full max-w-[2100px] mx-auto px-3 sm:px-6 md:px-10 lg:px-14 flex flex-col">
            
            {/* Row 1: Primary Title & Desktop Navigation aligned to the exact visual bottom of the letters */}
            <div className="flex items-end justify-between gap-2 sm:gap-4 w-full">
              {/* Brand Title: "The" (White), "Meadow" (Sage Marsh Green #9AB17A), "Lens" (Dusk Gold #F7C873) */}
              <Link href="/" className="group relative z-50 min-w-0 shrink pr-1 sm:pr-2">
                <h1 
                  className="leading-[1.04] pt-0.5 -mb-[4px] xs:-mb-[5px] sm:-mb-[8px] md:-mb-[9px] xl:-mb-[11px] whitespace-nowrap tracking-normal font-normal drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] transition-opacity duration-200 group-hover:opacity-90 text-[clamp(1.25rem,6.1vw,1.7rem)] sm:text-4xl md:text-[46px] xl:text-[54px]"
                  style={{ fontFamily: 'var(--font-logo)' }}
                >
                  <span className="text-white">The </span>
                  <span style={{ color: '#9AB17A' }}>Meadow </span>
                  <span style={{ color: '#F7C873' }}>Lens</span>
                </h1>
              </Link>

              {/* Desktop Navigation — visual bottom of text aligned on the exact same horizontal line as the bottom of "The Meadow Lens" */}
              <div className="hidden lg:flex items-center space-x-6 xl:space-x-9 shrink-0 leading-none">
                
                <Link href="/" className="text-white uppercase tracking-widest text-xs font-semibold leading-none hover:text-[#9AB17A] transition-colors">
                  HOME
                </Link>

                <Link href="/bird-index" className="text-white uppercase tracking-widest text-xs font-semibold leading-none hover:text-[#9AB17A] transition-colors">
                  Species Index
                </Link>

                <Link href="/category/guest-photos" className="text-white uppercase tracking-widest text-xs font-semibold leading-none hover:text-[#9AB17A] transition-colors">
                  Guest Photos
                </Link>

                <Link href="/artist" className="text-white uppercase tracking-widest text-xs font-semibold leading-none hover:text-[#9AB17A] transition-colors">
                  The Artist
                </Link>

                <Link href="/news" className="text-white uppercase tracking-widest text-xs font-semibold leading-none hover:text-[#9AB17A] transition-colors">
                  What&apos;s New
                </Link>

                <Link href="?inquire=true" scroll={false} className="text-white uppercase tracking-widest text-xs font-semibold leading-none hover:text-[#9AB17A] transition-colors">
                  Inquiries &amp; Comments
                </Link>

              </div>

              {/* Mobile Hamburger Trigger */}
              <button 
                type="button"
                aria-label="Open Navigation Menu"
                className="lg:hidden shrink-0 mb-0.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-black/70 border border-white/20 text-white uppercase tracking-widest text-[10px] sm:text-[11px] font-mono font-semibold drop-shadow-md z-50 flex items-center gap-1.5 sm:gap-2 active:scale-95 transition-transform"
                onClick={() => setMobileMenuOpen(true)}
              >
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span>Menu</span>
              </button>
            </div>

            {/* Full-width light gray separating line (6pt / 6px) below the page title and right-hand menu */}
            <div
              aria-hidden="true"
              className="w-full h-[5px] sm:h-[6px] bg-neutral-400/85 mt-1.5 sm:mt-2 rounded-[1px]"
            />

            {/* Row 2: Tightened, wider-tracked 2-line Slogan + [Explore The Venues] [Meet David] + Shutter Blade Icon */}
            <div
              className={`transition-[max-height,opacity,margin] duration-300 overflow-hidden ${
                scrolled ? 'max-h-0 opacity-0 mt-0' : 'max-h-32 opacity-100 mt-1.5'
              }`}
            >
              <div className="flex flex-col w-full max-w-full overflow-hidden">
                <Link
                  href="/"
                  tabIndex={-1}
                  className="block text-neutral-200 font-mono text-[clamp(7.5px,2.2vw,10px)] sm:text-[10.5px] md:text-[11.5px] xl:text-[12.5px] uppercase tracking-[0.04em] xs:tracking-[0.09em] sm:tracking-[0.25em] md:tracking-[0.27em] drop-shadow-md leading-[1.22] sm:leading-[1.15] hover:text-white transition-colors"
                >
                  <span className="block truncate sm:whitespace-normal">&ldquo;Wow Factor&rdquo; Photography of Birds, Wildlife &amp; Nature</span>
                  <span className="block pl-1 sm:pl-3 truncate sm:whitespace-normal">&mdash; Centered on the New Jersey Meadowlands</span>
                </Link>

                {/* Action Buttons + Tiny Shutter Blade Graphic under the Slogan */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-6 mt-1.5 pl-1.5 sm:pl-10">
                  <Link
                    href="/#venues"
                    className="text-white hover:text-[#9AB17A] font-sans text-[11px] xs:text-xs sm:text-sm md:text-[15px] font-medium tracking-wide transition-colors"
                  >
                    [Explore The Venues]
                  </Link>
                  <Link
                    href="/artist"
                    className="text-white hover:text-[#F7C873] font-sans text-[11px] xs:text-xs sm:text-sm md:text-[15px] font-medium tracking-wide transition-colors"
                  >
                    [Meet David]
                  </Link>
                  {/* Tiny Camera Shutter Blade Graphic */}
                  <span
                    title="The Meadow Lens Aperture"
                    aria-hidden="true"
                    className="inline-flex items-center justify-center w-4 h-4 sm:w-[22px] sm:h-[22px] rounded-full bg-neutral-800/90 border border-neutral-400/80 shadow-sm shrink-0"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="w-3 h-3 sm:w-4 sm:h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" className="text-neutral-300" />
                      <line x1="14.31" y1="8" x2="20.05" y2="17.94" />
                      <line x1="9.69" y1="8" x2="21.17" y2="8" />
                      <line x1="7.38" y1="12" x2="13.12" y2="2.06" />
                      <line x1="9.69" y1="16" x2="3.95" y2="6.06" />
                      <line x1="14.31" y1="16" x2="2.83" y2="16" />
                      <line x1="16.62" y1="12" x2="10.88" y2="21.94" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>

          </div>
        </nav>
      </header>

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
            className="text-3xl sm:text-4xl drop-shadow-md whitespace-nowrap"
            style={{ fontFamily: 'var(--font-logo)' }}
          >
            <span className="text-white">The </span>
            <span style={{ color: '#9AB17A' }}>Meadow </span>
            <span style={{ color: '#F7C873' }}>Lens</span>
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


