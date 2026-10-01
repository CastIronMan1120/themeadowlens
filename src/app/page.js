import { client } from '../sanity/lib/client'
import Link from 'next/link'

export const revalidate = 0 

export default async function Home() {
  const query = `*[_type == "category" && !defined(parentCategory) && !(title in ["Everything", "Compilations", "Captioned Works", "Guest Photos"])] | order(title asc) {
    _id,
    title,
    slug,
    "imageUrl": menuImage.asset->url
  }`
  const venues = await client.fetch(query)

  return (
    <main className="min-h-screen bg-black">
      
      {/* 1. THE WELCOME ENTRANCE */}
      <section className="relative w-full pt-48 pb-16 px-6 md:px-12 lg:px-24 max-w-[2000px] mx-auto flex items-center">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start w-full">
          
          {/* Left Column: Branding & Lens */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
            
            <div className="w-full max-w-lg mt-8 rounded-full overflow-hidden border-8 border-neutral-900 shadow-2xl relative aspect-square">
              <img 
                src="https://d15yhgn2ui21mw.cloudfront.net/production/27828/MDAwMDAwMDAwMDAw7QGraePd6CACehR_ZcfBFYwXu2FyveAYEUnRGwCTQQQLtneRwWETeR6yOMFIOjy24aDow_LJj7F22f2vd2S3k0FN_38EZqodfTc2xEuhDJufAHDziomoKXOdJ3Hs_jG_Da6jI5Eudq_OlWAGPJ5eMn5GdWubauzcA36GcgRY1fWMRXAyI_kns64GDLOzMbtDhp4MzfALcUQj-6GhUPrzz2cP26jvMuXkEAQK9UuhPaFh6sZ0WiHUxvwkfo0iBUIvrtzbVMJOQCKJtixHhM2uAFAzJqp3tkw9CK1Q-UUQdYf17tBc8FtuRPZjA0HS8f5UQNMgYWf3w4K_o-rz34O8o0_KFsf5lFPtzMsdvKDrF20U_Yv9QZ62UCQwOpCzcYBMuUz2OSK6lNEue5NbDJrMm6IGoPAHiyZ5_g61_8NiomtEwYlgpUDMZK8TyFQcauOrq_vNZrrN3XuD-pTFsS_tRZSwoQhWGDTxkzfRjWOFZqNs5sSydA.jpg" 
                alt="The Meadow Lens Composite" 
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right Column: Cardinal & Welcome Letter */}
          <div className="flex flex-col space-y-8">
            <div className="w-full aspect-[4/3] relative overflow-hidden rounded-md shadow-2xl">
               <img 
                src="https://d15yhgn2ui21mw.cloudfront.net/production/27828/MDAwMDAwMDAwMDAw7QGraePd6CACehR_ZcfBFYwXu2FyveAYEUnRGwCTQQQLtneRwWETeR6yOMFIOjy24aDow_LJj7F22f2vd2S3k0FN_38EZqodfTc2xEuhDJufAHDziomoKXOdJ3Hs_jG_Da6jI5Eudq_OlWAGPJ5eMn5SVizHNoqjVGKBfhUP58mXRnMzJf0jqt1SUen0BLgI3pE92_gRXVg-6LuoU7ytliAZ0MakIbKhUR5YqEvrdqExp4pvWSfBw-lyLdR8Rkw3gs6dRsUeF3XNpGs4k8D_awBPQVsnmE08y6oKQQw.jpg" 
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

      {/* 2. VENUES TILE GRID */}
      <section id="venues" className="min-h-screen p-4 sm:p-8 md:p-16 max-w-[2400px] mx-auto bg-neutral-950 relative z-20">
        
        <div className="max-w-4xl mx-auto text-center mb-16 mt-12">
          <h2 className="text-3xl md:text-4xl font-light text-white mb-6 tracking-wide">Explore The Venues</h2>
          <p className="text-neutral-400 font-light text-lg">
            Step into our digital halls. Select a venue below to explore the collection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {venues.map((venue) => (
            <Link 
              href={`/category/${venue.slug.current}`} 
              key={venue._id}
              className="group relative aspect-[4/3] overflow-hidden bg-neutral-900 block"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
                style={{ backgroundImage: `url('${venue.imageUrl || "/room-preview.jpg"}')` }}
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <h3 className="text-3xl md:text-4xl text-white font-light tracking-widest uppercase text-center drop-shadow-2xl shadow-black group-hover:scale-110 transition-transform duration-500">
                  {venue.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>
      
    </main>
  )
}
