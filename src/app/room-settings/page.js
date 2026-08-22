import Link from 'next/link'

export const metadata = {
  title: 'Virtual Exhibitions & Room Settings | The Meadow Lens',
  description: 'Preview high-end fine art photography in stunning virtual room settings.',
}

export default function RoomSettingsPage() {
  return (
    <main className="min-h-screen pt-32 pb-24 px-8 sm:px-12 md:px-24 max-w-[2000px] mx-auto text-white">
      
      <div className="max-w-4xl mx-auto text-center mb-24">
        <h1 className="text-5xl md:text-6xl font-light tracking-wide mb-8">Virtual Exhibitions</h1>
        <p className="text-neutral-400 text-lg lg:text-xl font-light leading-relaxed mb-12">
          Experience the scale, mood, and presence of our fine art photography before making an acquisition. Our interactive Room Settings feature allows you to preview any piece in three distinct environments.
        </p>
        <Link href="/category/birds" className="inline-block border border-white text-white px-10 py-5 uppercase tracking-widest text-sm font-semibold hover:bg-white hover:text-black transition-colors">
          Explore Exhibitions
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        
        {/* Room 1 */}
        <div className="flex flex-col space-y-6">
          <div className="aspect-[4/3] bg-cover bg-center rounded-sm" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1000')" }}></div>
          <div>
            <h3 className="text-xl font-light tracking-widest uppercase mb-2">Modern Living Room</h3>
            <p className="text-neutral-500 text-sm leading-relaxed">Bright, lifestyle-oriented settings perfect for evaluating how a piece breathes life into everyday spaces.</p>
          </div>
        </div>

        {/* Room 2 */}
        <div className="flex flex-col space-y-6">
          <div className="aspect-[4/3] bg-cover bg-center rounded-sm" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1000')" }}></div>
          <div>
            <h3 className="text-xl font-light tracking-widest uppercase mb-2">Dark Gallery Wall</h3>
            <p className="text-neutral-500 text-sm leading-relaxed">Moody and dramatic environments designed to highlight the profound contrast and color depth of the work.</p>
          </div>
        </div>

        {/* Room 3 */}
        <div className="flex flex-col space-y-6">
          <div className="aspect-[4/3] bg-cover bg-center rounded-sm" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1000')" }}></div>
          <div>
            <h3 className="text-xl font-light tracking-widest uppercase mb-2">Minimalist Office</h3>
            <p className="text-neutral-500 text-sm leading-relaxed">Sleek, professional spaces where the artwork serves as a focal point of inspiration.</p>
          </div>
        </div>

      </div>

      <div className="mt-32 pt-16 border-t border-white/10 text-center">
        <p className="text-neutral-400 text-sm uppercase tracking-widest font-mono">
          To use this feature, simply click &quot;Room Settings&quot; on any artwork card in our galleries.
        </p>
      </div>
      
    </main>
  )
}
