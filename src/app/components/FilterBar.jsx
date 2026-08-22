'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'

export default function FilterBar({ availableSpecies, availableColors, availableSizes }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentSpecies = searchParams.get('species') || ''
  const currentColor = searchParams.get('color') || ''
  const currentSize = searchParams.get('size') || ''

  const createQueryString = useCallback(
    (name, value) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      return params.toString()
    },
    [searchParams]
  )

  const handleFilterChange = (name, value) => {
    router.push(pathname + '?' + createQueryString(name, value), { scroll: false })
  }

  if (availableSpecies.length === 0 && availableColors.length === 0 && availableSizes.length === 0) {
    return null
  }

  return (
    <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-8 md:px-16 mb-12 flex flex-wrap gap-4 items-center justify-center">
      
      {availableSpecies.length > 0 && (
        <select 
          value={currentSpecies}
          onChange={(e) => handleFilterChange('species', e.target.value)}
          className="bg-neutral-900 border border-neutral-700 text-neutral-300 text-sm uppercase font-mono tracking-widest px-4 py-2 rounded-sm focus:outline-none focus:border-white transition-colors cursor-pointer appearance-none"
        >
          <option value="">All Species</option>
          {availableSpecies.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      )}

      {availableColors.length > 0 && (
        <select 
          value={currentColor}
          onChange={(e) => handleFilterChange('color', e.target.value)}
          className="bg-neutral-900 border border-neutral-700 text-neutral-300 text-sm uppercase font-mono tracking-widest px-4 py-2 rounded-sm focus:outline-none focus:border-white transition-colors cursor-pointer appearance-none"
        >
          <option value="">All Colors</option>
          {availableColors.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      )}

      {availableSizes.length > 0 && (
        <select 
          value={currentSize}
          onChange={(e) => handleFilterChange('size', e.target.value)}
          className="bg-neutral-900 border border-neutral-700 text-neutral-300 text-sm uppercase font-mono tracking-widest px-4 py-2 rounded-sm focus:outline-none focus:border-white transition-colors cursor-pointer appearance-none"
        >
          <option value="">All Sizes</option>
          {availableSizes.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      )}

      {(currentSpecies || currentColor || currentSize) && (
        <button 
          onClick={() => router.push(pathname, { scroll: false })}
          className="text-neutral-500 hover:text-white text-xs uppercase font-mono tracking-widest transition-colors ml-4 border-b border-neutral-700 hover:border-white pb-1"
        >
          Clear Filters
        </button>
      )}

    </div>
  )
}
