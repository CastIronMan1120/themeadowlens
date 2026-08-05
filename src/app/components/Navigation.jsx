'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Navigation() {
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

  return (
    <>
      {/* The Floating Minimalist Trigger */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed top-8 right-8 z-40 text-white/70 hover:text-white transition-all duration-500 uppercase tracking-widest text-xs font-semibold ${scrolled && !isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        Menu
      </button>

      {/* The Glassmorphism Full-Screen Overlay */}
      <div 
        className={`fixed inset-0 z-50 bg-black/90 backdrop-blur-xl transition-all duration-700 flex flex-col items-center justify-center ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-8 right-8 text-white/50 hover:text-white text-3xl font-light transition-colors"
        >
          &times;
        </button>

        <nav className="flex flex-col items-center space-y-8 md:space-y-12">
          <Link href="/" onClick={() => setIsOpen(false)} className="text-3xl md:text-5xl font-light text-white/70 hover:text-white transition-colors">
            The Exhibition
          </Link>
          <Link href="/" onClick={() => setIsOpen(false)} className="text-3xl md:text-5xl font-light text-white/70 hover:text-white transition-colors">
            Curated Collections
          </Link>
          <Link href="/" onClick={() => setIsOpen(false)} className="text-3xl md:text-5xl font-light text-white/70 hover:text-white transition-colors">
            The Artist
          </Link>
          <a href="mailto:dmc1120@themeadowlens.com" className="text-3xl md:text-5xl font-light text-white/70 hover:text-white transition-colors">
            Private Inquiries
          </a>
        </nav>
      </div>
    </>
  )
}
