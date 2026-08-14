'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Navigation({ categories = [] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Hide hamburger button when scrolling down to keep art uninterrupted
  useEffect(() => {
    let lastScrollY = window.scrollY
    const handleScroll = () => {
      if (window.scrollY > 100 && window.scrollY > lastScrollY) {
        setScrolled(true) // Hide
      } else {
        setScrolled(false) // Show
      }
      lastScrollY = window.scrollY
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Sort categories: Birds first, then alphabetical
  const sortedCategories = [...categories].sort((a, b) => {
    if (a.title.toLowerCase() === 'birds') return -1
    if (b.title.toLowerCase() === 'birds') return 1
    return a.title.localeCompare(b.title)
  })

  return (
    <>
      {/* The Global Top Navigation */}
      <div className={`fixed top-0 left-0 w-full p-8 z-40 flex justify-between items-center transition-all duration-500 ${scrolled && !isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <Link 
          href="/" 
          className="text-2xl md:text-3xl font-normal tracking-wide text-white mix-blend-difference" 
          style={{ fontFamily: 'var(--font-logo)' }}
        >
          The Meadow Lens
        </Link>
        
        {/* The Floating Minimalist Trigger */}
        <button 
          onClick={() => setIsOpen(true)}
          className="text-white/70 hover:text-white transition-all duration-500 uppercase tracking-widest text-xs font-semibold mix-blend-difference"
        >
          Menu
        </button>
      </div>

      {/* The Glassmorphism Mega Menu Overlay */}
      <div 
        className={`fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl transition-all duration-700 flex flex-col items-center justify-center p-8 overflow-y-auto ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-8 right-8 text-white/50 hover:text-white text-3xl font-light transition-colors"
        >
          &times;
        </button>

        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-16 mt-16 md:mt-0">
          
          {/* Left Side: Standard Links */}
          <nav className="flex flex-col space-y-8 md:space-y-12">
            <h2 className="text-neutral-500 text-sm tracking-[0.3em] uppercase mb-4">Navigation</h2>
            <Link href="/#exhibition" onClick={() => setIsOpen(false)} className="text-3xl md:text-5xl font-light text-white/70 hover:text-white transition-colors">
              The Exhibition
            </Link>
            <Link href="/" onClick={() => setIsOpen(false)} className="text-3xl md:text-5xl font-light text-white/70 hover:text-white transition-colors">
              The Artist
            </Link>
            <a href="mailto:dmc1120@themeadowlens.com" className="text-3xl md:text-5xl font-light text-white/70 hover:text-white transition-colors">
              Private Inquiries
            </a>
          </nav>

          {/* Right Side: Category Mega Menu */}
          <div className="flex flex-col">
            <h2 className="text-neutral-500 text-sm tracking-[0.3em] uppercase mb-8">Curated Collections</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
              {sortedCategories.length > 0 ? (
                sortedCategories.map(cat => (
                  <Link 
                    key={cat._id}
                    href={`/category/${cat.slug?.current}`} 
                    onClick={() => setIsOpen(false)} 
                    className="text-xl font-light text-neutral-300 hover:text-white transition-colors"
                  >
                    {cat.title}
                  </Link>
                ))
              ) : (
                <p className="text-neutral-600 italic">Categories will appear here once added in the Admin dashboard.</p>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </>
  )
}
