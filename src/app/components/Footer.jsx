import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="w-full bg-black border-t border-white/10 pt-8 sm:pt-12 pb-6 sm:pb-8 text-neutral-400 relative z-10">
      <div className="max-w-[2100px] mx-auto px-4 sm:px-6 md:px-10 lg:px-14 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 items-start">
        
        {/* 1. The Branding */}
        <div className="flex flex-col">
          <Link
            href="/"
            className="text-2xl sm:text-3xl md:text-4xl font-normal text-white tracking-normal hover:opacity-80 transition-opacity leading-snug"
            style={{ fontFamily: 'var(--font-logo)' }}
          >
            The Meadow Lens
          </Link>
          <p className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.14em] sm:tracking-[0.16em] mt-1.5 text-neutral-300 leading-snug">
            <span className="block">&ldquo;Wow Factor&rdquo; Photography of Birds, Wildlife &amp; Nature</span>
            <span className="block mt-0.5 text-neutral-400">&mdash; Centered on the New Jersey Meadowlands</span>
          </p>
          <p className="text-xs text-neutral-500 mt-3 max-w-sm leading-relaxed">
            Fine art nature &amp; wildlife photography by Northern NJ native David McClure.
          </p>
        </div>

        {/* 2. Gallery Navigation & Internal Pages */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 text-xs sm:text-sm uppercase tracking-wider sm:tracking-widest font-mono">
          <div className="flex flex-col space-y-3">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/#venues" className="hover:text-white transition-colors">The Venues</Link>
            <Link href="/bird-index" className="hover:text-white transition-colors">Species Index</Link>
            <Link href="/category/guest-photos" className="hover:text-white transition-colors text-emerald-400/90 hover:text-emerald-300">Guest Photos</Link>
          </div>
          <div className="flex flex-col space-y-3">
            <Link href="/artist" className="hover:text-white transition-colors">The Artist</Link>
            <Link href="/news" className="hover:text-white transition-colors">What&apos;s New</Link>
            <Link href="?inquire=true" scroll={false} className="hover:text-white transition-colors">Inquiries &amp; Comments</Link>
            <Link href="/sitemap" className="hover:text-white transition-colors">Site Directory</Link>
          </div>
        </div>

        {/* 3. Social Proof */}
        <div className="flex flex-col md:items-end space-y-3 sm:space-y-4 text-xs sm:text-sm uppercase tracking-widest font-mono">
          <span className="text-xs text-neutral-600 uppercase tracking-[0.2em]">Follow &amp; Contact</span>
          <div className="flex flex-wrap md:flex-col gap-6 md:gap-3 md:items-end">
            <a href="https://www.facebook.com/themeadowlens/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Facebook</a>
            <a href="https://www.instagram.com/themeadowlens/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a>
            <a href="mailto:dmc1120@themeadowlens.com" className="text-neutral-400 hover:text-emerald-300 transition-colors lowercase">dmc1120@themeadowlens.com</a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-[2100px] mx-auto px-4 sm:px-6 md:px-10 lg:px-14 mt-8 sm:mt-10 pt-5 sm:pt-6 border-t border-white/10 text-[11px] sm:text-xs font-mono uppercase tracking-wider sm:tracking-widest flex flex-col md:flex-row justify-between items-center text-center md:text-left opacity-50 gap-2">
        <p>&copy; {new Date().getFullYear()} The Meadow Lens — David McClure. All rights reserved.</p>
        <p>Exit 16W • The Meadowlands, New Jersey</p>
      </div>
    </footer>
  )
}
