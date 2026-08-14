import { client } from '../sanity/lib/client'
import Gallery from './components/Gallery'

export const revalidate = 0 

export default async function Home() {
  const query = `*[_type == "artwork"] | order(_createdAt desc)`
  const artworks = await client.fetch(query)

  return (
    <main className="min-h-screen bg-black">
      
      {/* 1. THE WELCOME ENTRANCE */}
      <section className="relative w-full min-h-[100svh] pt-32 pb-16 px-6 md:px-12 lg:px-24 max-w-[2000px] mx-auto flex items-center">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start w-full">
          
          {/* Left Column: Branding & Lens */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
            <h1 className="text-5xl md:text-7xl lg:text-8xl text-white" style={{ fontFamily: 'var(--font-logo)' }}>
              The Meadow Lens
            </h1>
            <p className="text-lg md:text-xl text-neutral-300 italic max-w-lg">
              Inspiring nature photography captured in the NJ Meadowlands and beyond!
            </p>
            
            <div className="w-full max-w-lg mt-8 rounded-full overflow-hidden border-8 border-neutral-900 shadow-2xl relative aspect-square">
              {/* Replace with actual circular lens image path */}
              <img 
                src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800" 
                alt="The Meadow Lens Composite" 
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right Column: Cardinal & Welcome Letter */}
          <div className="flex flex-col space-y-8">
            <div className="w-full aspect-[4/3] relative overflow-hidden rounded-md shadow-2xl">
               {/* Replace with actual cardinal image path */}
               <img 
                src="https://images.unsplash.com/photo-1552728089-571ed928663f?auto=format&fit=crop&q=80&w=800" 
                alt="Cardinal in the Meadowlands" 
                className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            
            <div>
              <h2 className="text-4xl text-white mb-6">Welcome!</h2>
              
              <div className="space-y-4 text-neutral-300 text-base md:text-lg leading-relaxed">
                <p>Hello! I'm photographer and Northern NJ native David McClure.</p>
                <p>
                  Thank you for visiting my gallery, where I showcase the allure of nature's living creatures, with special emphasis on birds, as well as captivating NYC skyline views, sunsets, aircraft, trains and anything else that is photo-worthy, captured almost exclusively in and around the marshes, creeks, forests, environmental parks, protected lands, and former landfills of the NJ Meadowlands.
                </p>
                <p>
                  In NJ lingo, it's not uncommon for someone to ask, "what's your exit?", meaning "what NJ Turnpike exit do you live off of?". My answer to this question would surely be that I live off of Exit 16W of the Atlantic Flyway! The Atlantic Flyway is the major migratory route for birds traveling up and down the eastern seaboard of the United States, shadowing Interstate 95, which, in NJ, is known as the NJ Turnpike. This gallery is chock-full of those beautiful birds and nature's surrounding flora and other fauna that they co-exist with. I hope you enjoy the pictures and my occasional narratives on this unique region.
                </p>
                <p className="italic pt-2">
                  After all, this is "The Meadowlands", and I'm "The Meadow LENS"! ... get it?
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. THE EXHIBITION ROOMS GALLERY */}
      <section id="exhibition" className="min-h-screen p-4 sm:p-8 md:p-16 max-w-[2400px] mx-auto bg-neutral-950 relative z-20">
        
        <div className="max-w-3xl mx-auto text-center mb-24 mt-12">
          <h2 className="text-3xl md:text-4xl font-light text-white mb-6">The Curated Collection</h2>
          <p className="text-neutral-400 font-light leading-relaxed">
            Every piece is displayed in scale. Hover to examine the details. Click to inquire about acquisition.
          </p>
        </div>

        {artworks.length > 0 ? (
          <Gallery artworks={artworks} />
        ) : (
          <div className="text-center text-neutral-500 mt-24">
            <p>The gallery is currently empty.</p>
            <p className="text-sm mt-2">Upload your first artwork in the Sanity Dashboard to see it here.</p>
          </div>
        )}
      </section>
      
    </main>
  )
}
