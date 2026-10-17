import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="w-full bg-black border-t border-white/10 pt-16 pb-8 px-8 sm:px-12 md:px-24 text-neutral-400 relative z-10">
      <div className="max-w-[2000px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
        
        {/* 1. The Branding */}
        <div className="flex flex-col">
          <Link href="/" className="text-2xl md:text-3xl font-light text-white tracking-widest uppercase hover:opacity-80 transition-opacity">
            The Meadow Lens
          </Link>
          <p className="text-xs uppercase tracking-[0.3em] mt-2 font-semibold text-neutral-500">Naturally.</p>
          <p className="text-xs text-neutral-500 mt-4 max-w-xs leading-relaxed">
            Fine art nature & wildlife photography by Northern NJ native David McClure.
          </p>
        </div>

        {/* 2. Gallery Navigation & Internal Pages */}
        <div className="grid grid-cols-2 gap-6 text-sm uppercase tracking-widest font-mono">
          <div className="flex flex-col space-y-3">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/#venues" className="hover:text-white transition-colors">The Venues</Link>
            <Link href="/bird-index" className="hover:text-white transition-colors">Species Index</Link>
            <Link href="/category/guest-photos" className="hover:text-white transition-colors text-emerald-400/90 hover:text-emerald-300">Guest Photos</Link>
          </div>
          <div className="flex flex-col space-y-3">
            <Link href="/artist" className="hover:text-white transition-colors">The Artist</Link>
            <Link href="/news" className="hover:text-white transition-colors">What's New</Link>
            <Link href="?inquire=true" scroll={false} className="hover:text-white transition-colors">Inquiries & Comments</Link>
            <Link href="/sitemap" className="hover:text-white transition-colors">Site Directory</Link>
          </div>
        </div>

        {/* 3. Social Proof */}
        <div className="flex flex-col md:items-end space-y-4 text-sm uppercase tracking-widest font-mono">
          <span className="text-xs text-neutral-600 uppercase tracking-[0.2em]">Follow The Gallery</span>
          <a href="https://www.facebook.com/themeadowlens/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Facebook</a>
          <a href="https://www.instagram.com/themeadowlens/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-[2000px] mx-auto mt-16 pt-8 border-t border-white/10 text-xs font-mono uppercase tracking-widest flex flex-col md:flex-row justify-between items-center opacity-50">
        <p>&copy; {new Date().getFullYear()} The Meadow Lens — David McClure. All rights reserved.</p>
        <p className="mt-4 md:mt-0">Exit 16W • The Meadowlands, New Jersey</p>
      </div>
    </footer>
  )
}
