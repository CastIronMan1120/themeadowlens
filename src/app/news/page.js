import Link from 'next/link'

export const metadata = {
  title: "What's New | The Meadow Lens",
  description: 'The latest updates, exhibitions, and news from David McClure.',
}

export default function NewsPage() {
  const newsItems = [
    {
      id: 1,
      date: 'August 14, 2026',
      title: 'The New Meadow Lens Gallery is Live',
      description: 'Welcome to the complete digital overhaul of The Meadow Lens. I have rebuilt the entire gallery from the ground up to provide a more immersive, high-resolution viewing experience for my collectors. The new platform features expansive "Exhibition Rooms", advanced sorting by species and color, and a seamless interface for private inquiries.',
      tag: 'Announcement'
    },
    {
      id: 2,
      date: 'August 2, 2026',
      title: 'Tracking the Atlantic Flyway',
      description: 'This past weekend I spent 14 hours stationed near Exit 16W, documenting the early migratory patterns of the local raptor population. The atmospheric haze from the city provided an incredible backdrop for the shots. I am currently editing this series and will be adding the first few limited editions to the "Birds" collection next week.',
      tag: 'Field Notes'
    },
    {
      id: 3,
      date: 'July 15, 2026',
      title: 'Meadowlands Macro Series',
      description: 'While I am known primarily for avian photography, I have been turning my macro lens toward the fascinating insect life thriving in the protected lands. The "Insects" category has just been updated with several new high-contrast studies of local pollinators.',
      tag: 'New Art'
    }
  ]

  return (
    <main className="min-h-screen bg-black">
      <section className="relative w-full pt-40 pb-24 px-6 md:px-12 lg:px-24 max-w-[1200px] mx-auto">
        
        <div className="mb-24 text-center">
          <h1 className="text-6xl md:text-8xl text-white font-light tracking-tight mb-6">
            What's New
          </h1>
          <p className="text-neutral-400 text-lg md:text-xl uppercase tracking-widest font-mono">
            Dispatches from Exit 16W
          </p>
        </div>

        <div className="space-y-16 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-neutral-800 before:to-transparent">
          
          {newsItems.map((item, index) => (
            <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              
              {/* Timeline Dot */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-black bg-neutral-700 group-hover:bg-white text-neutral-500 group-hover:text-black shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-colors duration-500 z-10">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 16 16"><path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 14c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z"></path><path d="M9 4H7v5h5V7H9V4z"></path></svg>
              </div>
              
              {/* Content Card */}
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-8 rounded-sm bg-neutral-900 border border-neutral-800 hover:border-neutral-600 transition-colors duration-500 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-neutral-400 font-mono text-sm tracking-widest">{item.date}</span>
                  <span className="px-3 py-1 bg-white text-black text-xs font-bold uppercase tracking-wider">{item.tag}</span>
                </div>
                <h3 className="text-2xl text-white font-light mb-4">{item.title}</h3>
                <p className="text-neutral-400 leading-relaxed">
                  {item.description}
                </p>
              </div>

            </div>
          ))}

        </div>

      </section>
    </main>
  )
}
