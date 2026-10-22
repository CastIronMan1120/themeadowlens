import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="w-full bg-black border-t border-white/10 pt-12 sm:pt-16 pb-8 px-5 sm:px-12 md:px-24 text-neutral-400 relative z-10">
      <div className="max-w-[2000px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 items-start">
        
        {/* 1. The Branding */}
        <div className="flex flex-col">
          <Link href="/" className="text-xl sm:text-2xl md:text-3xl font-light text-white tracking-widest uppercase hover:opacity-80 transition-opacity">
            The Meadow Lens
          </Link>
          <p className="text-xs uppercase tracking-[0.3em] mt-2 font-semibold text-neutral-500">Naturally.</p>
          <p className="text-xs text-neutral-500 mt-4 max-w-xs leading-relaxed">
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
      <div className="max-w-[2000px] mx-auto mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-white/10 text-[11px] sm:text-xs font-mono uppercase tracking-wider sm:tracking-widest flex flex-col md:flex-row justify-between items-center text-center md:text-left opacity-50 gap-2">
        <p>&copy; {new Date().getFullYear()} The Meadow Lens — David McClure. All rights reserved.</p>
        <p>Exit 16W • The Meadowlands, New Jersey</p>
      </div>
    </footer>
  )
}
