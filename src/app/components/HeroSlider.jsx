'use client'

import { useState, useEffect } from 'react'

export default function HeroSlider({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Auto-advance
  useEffect(() => {
    if (!images || images.length <= 1) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [images])

  if (!images || images.length === 0) return null

  return (
    <div className="absolute inset-0 w-full h-full bg-neutral-900">
      {images.map((imgObj, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            idx === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={typeof imgObj === 'string' ? imgObj : imgObj.url}
            alt={typeof imgObj === 'string' ? "Featured Photography by David McClure" : (imgObj.title || "Featured Photography by David McClure")}
            className="w-full h-full object-cover object-center"
            loading={idx === 0 ? "eager" : "lazy"}
          />
        </div>
      ))}
    </div>
  )
}
