import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="w-full bg-black border-t border-white/10 pt-16 pb-8 px-8 sm:px-12 md:px-24 text-neutral-400 relative z-10">
      <div className="max-w-[2000px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center space-y-12 md:space-y-0">
        
        {/* The Branding */}
        <div className="flex flex-col">
          <h2 className="text-2xl md:text-3xl font-light text-white tracking-widest uppercase" style={{ fontFamily: 'var(--font-geist-sans)' }}>
            The Meadow Lens
          </h2>
          <p className="text-xs uppercase tracking-[0.3em] mt-2 font-semibold">Naturally.</p>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col space-y-4 text-sm uppercase tracking-widest font-mono">
          <Link href="/#exhibition" className="hover:text-white transition-colors">Exhibitions</Link>
          <a href="mailto:dmc1120@themeadowlens.com" className="hover:text-white transition-colors">Private Inquiries</a>
        </div>

        {/* Social Proof */}
        <div className="flex flex-col space-y-4 text-sm uppercase tracking-widest font-mono">
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Facebook</a>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-[2000px] mx-auto mt-16 pt-8 border-t border-white/10 text-xs font-mono uppercase tracking-widest flex flex-col md:flex-row justify-between items-center opacity-50">
        <p>&copy; {new Date().getFullYear()} The Meadow Lens. All rights reserved.</p>
        <p className="mt-4 md:mt-0">New Jersey, USA</p>
      </div>
    </footer>
  )
}
