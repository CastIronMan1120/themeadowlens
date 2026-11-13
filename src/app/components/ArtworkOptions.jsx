'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import WallPreviewStudio from './WallPreviewStudio'

export default function ArtworkOptions({
  inquiryLink,
  isReserved,
  isAcquired,
  imageUrl,
  artworkTitle,
}) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [studioOpen, setStudioOpen] = useState(false)

  // Automatically open Room Visualizer if navigated with ?visualize=true
  useEffect(() => {
    if (searchParams?.get('visualize') === 'true') {
      setStudioOpen(true)
    }
  }, [searchParams])

  const handleCloseStudio = () => {
    setStudioOpen(false)
    if (searchParams?.get('visualize') === 'true') {
      const params = new URLSearchParams(searchParams.toString())
      params.delete('visualize')
      const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
      router.replace(nextUrl, { scroll: false })
    }
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full max-w-2xl">
        {/* Primary Action: Visualize in a Room */}
        <button
          type="button"
          onClick={() => setStudioOpen(true)}
          className="w-full min-h-[48px] flex items-center justify-center gap-2.5 border border-white/30 bg-white text-black hover:bg-neutral-200 active:scale-[0.99] px-5 py-3.5 sm:px-6 sm:py-4 uppercase tracking-widest text-xs sm:text-sm font-semibold transition-all rounded-sm shadow-lg cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 sm:w-5 sm:h-5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.75}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 9.75L12 3l9 6.75V20a1 1 0 01-1 1h-5.25v-6.25h-5.5V21H4a1 1 0 01-1-1V9.75z"
            />
          </svg>
          <span>Visualize in Room</span>
        </button>

        {/* Secondary Action: Inquire About This Piece */}
        {!isAcquired && (
          <Link
            href={inquiryLink}
            scroll={false}
            className="w-full min-h-[48px] flex items-center justify-center gap-2.5 border border-emerald-500/40 bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-200 hover:text-white px-5 py-3.5 sm:px-6 sm:py-4 uppercase tracking-widest text-xs sm:text-sm font-semibold transition-all rounded-sm text-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 sm:w-5 sm:h-5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.75}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
              />
            </svg>
            <span>{isReserved ? 'Join Collector Waitlist' : 'Inquire About This Piece'}</span>
          </Link>
        )}
      </div>

      {studioOpen && (
        <WallPreviewStudio
          imageUrl={imageUrl}
          artworkTitle={artworkTitle}
          inquiryLink={!isAcquired ? inquiryLink : undefined}
          onClose={handleCloseStudio}
        />
      )}
    </div>
  )
}
