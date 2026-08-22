import { client } from '../../../sanity/lib/client'
import Gallery from '../../components/Gallery'
import Link from 'next/link'

export const revalidate = 0 

// 1. Dynamic SEO Metadata Generation
export async function generateMetadata({ params }) {
  const { slug } = await params
  const categorySlug = slug[0]
  const subcategorySlug = slug[1] // Might be undefined

  let title = "Gallery"
  
  if (subcategorySlug) {
    const query = `*[_type == "category" && slug.current == $subcategorySlug][0]`
    const data = await client.fetch(query, { subcategorySlug })
    if (data?.title) title = data.title
  } else {
    const query = `*[_type == "category" && slug.current == $categorySlug][0]`
    const data = await client.fetch(query, { categorySlug })
    if (data?.title) title = data.title
  }

  return {
    title: `${title} | The Meadow Lens`,
    description: `Explore the ${title} fine art photography collection by David McClure.`,
  }
}

export default async function CategoryPage({ params }) {
  const { slug } = await params
  const categorySlug = slug[0]
  const subcategorySlug = slug[1]

  // Fetch the current category (or subcategory) to get its title
  const currentSlug = subcategorySlug || categorySlug
  const categoryQuery = `*[_type == "category" && slug.current == $currentSlug][0]`
  const category = await client.fetch(categoryQuery, { currentSlug })

  // Fetch sibling subcategories for the Filter Menu
  // If we are on a main category, fetch its children.
  // If we are on a subcategory, fetch its siblings (children of its parent).
  const parentSlugToQuery = subcategorySlug ? categorySlug : categorySlug
  const subcategoriesQuery = `*[_type == "category" && parentCategory->slug.current == $parentSlugToQuery] | order(title asc)`
  const subcategories = await client.fetch(subcategoriesQuery, { parentSlugToQuery })

  // Fetch artworks
  let artworks = []
  if (category) {
    const artworksQuery = `*[_type == "artwork" && (category->slug.current == $currentSlug || subcategory->slug.current == $currentSlug)] | order(_createdAt desc)`
    artworks = await client.fetch(artworksQuery, { currentSlug })
  }

  // FALLBACK TEMPLATE: If the category doesn't exist in Sanity, show the stunning placeholder!
  if (!category) {
    return (
      <main className="min-h-screen bg-neutral-950">
        
        {/* Placeholder Header */}
        <section className="pt-40 pb-8 px-6 md:px-12 text-center">
          <h1 className="text-5xl md:text-7xl lg:text-8xl text-white font-light tracking-tight mb-6 capitalize">
            {currentSlug.replace(/-/g, ' ')}
          </h1>
          <p className="text-xl text-neutral-400 font-mono tracking-widest uppercase">
            Curated Collection (Preview Mode)
          </p>
        </section>

        {/* Placeholder Subcategory Filter Bar */}
        <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-8 md:px-16 mb-12 border-b border-white/10 pb-8">
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            <Link 
              href={`/category/${categorySlug}`}
              className={`px-6 py-2 rounded-full border text-sm uppercase tracking-widest font-mono transition-colors ${!subcategorySlug ? 'bg-white text-black border-white' : 'bg-transparent text-neutral-400 border-neutral-700 hover:border-white hover:text-white'}`}
            >
              All
            </Link>
            <button className="px-6 py-2 rounded-full border border-neutral-700 bg-transparent text-neutral-400 text-sm uppercase tracking-widest font-mono opacity-50 cursor-not-allowed">
              Subcategory 1
            </button>
            <button className="px-6 py-2 rounded-full border border-neutral-700 bg-transparent text-neutral-400 text-sm uppercase tracking-widest font-mono opacity-50 cursor-not-allowed">
              Subcategory 2
            </button>
          </div>
          <p className="text-center text-neutral-500 text-xs mt-6 font-mono">
            [ Subcategories will populate here once added to Sanity ]
          </p>
        </div>

        {/* Placeholder Gallery */}
        <section className="p-4 sm:p-8 md:p-16 max-w-[2400px] mx-auto relative z-20">
          <div className="columns-1 md:columns-2 lg:columns-3 gap-12 space-y-12">
            {[
              { id: 1, title: "Great Blue Heron at Dawn", loc: "The Meadowlands, NJ", img: "https://images.unsplash.com/photo-1555621458-1c4b81c2f94c?q=80&w=2000&auto=format&fit=crop" },
              { id: 2, title: "Manhattan Skyline Twilight", loc: "Exit 16W Vantage", img: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=2000&auto=format&fit=crop" },
              { id: 3, title: "Northern Cardinal in Winter", loc: "NJ Environmental Park", img: "https://images.unsplash.com/photo-1552728089-571ed928663f?q=80&w=2000&auto=format&fit=crop" },
              { id: 4, title: "Golden Hour Commute (Train)", loc: "Meadowlands Rail", img: "https://images.unsplash.com/photo-1541818160481-9b626e2a2fb2?q=80&w=2000&auto=format&fit=crop" },
              { id: 5, title: "Monarch on Milkweed", loc: "Protected Wetlands", img: "https://images.unsplash.com/photo-1534063223023-45543c3a91bf?q=80&w=2000&auto=format&fit=crop" },
              { id: 6, title: "Storm Clouds Gathering", loc: "Over the Marshes", img: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?q=80&w=2000&auto=format&fit=crop" },
            ].map((art) => (
              <div key={art.id} className="group relative overflow-hidden rounded-sm mb-12 break-inside-avoid aspect-[4/3] bg-neutral-900 cursor-pointer border border-neutral-800">
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-[2s] ease-out group-hover:scale-105 opacity-60 group-hover:opacity-40"
                  style={{ backgroundImage: `url('${art.img}')` }}
                ></div>
                
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                   <p className="text-white/20 font-bold tracking-[0.5em] uppercase text-4xl -rotate-45">Preview</p>
                </div>

                <div className="absolute bottom-0 left-0 w-full p-8 flex flex-col justify-end transition-all duration-700 z-10 opacity-100 bg-gradient-to-t from-black/90 to-transparent">
                  <h3 className="text-white text-3xl font-light mb-2 drop-shadow-lg">{art.title}</h3>
                  <p className="text-neutral-300 text-sm font-mono uppercase tracking-widest drop-shadow-md">{art.loc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    )
  }

  // IF CATEGORY EXISTS IN SANITY, RENDER THE ACTUAL DATA
  return (
    <main className="min-h-screen bg-neutral-950">
      
      {/* Category Header */}
      <section className="pt-40 pb-8 px-6 md:px-12 text-center">
        <h1 className="text-5xl md:text-7xl lg:text-8xl text-white font-light tracking-tight mb-6">
          {category.title}
        </h1>
        <p className="text-xl text-neutral-400 font-mono tracking-widest uppercase">
          Curated Collection
        </p>
      </section>

      {/* Subcategory Filter Menu */}
      {subcategories.length > 0 && (
        <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-8 md:px-16 mb-12 border-b border-white/10 pb-8">
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            
            <Link 
              href={`/category/${categorySlug}`}
              className={`px-6 py-2 rounded-full border text-sm uppercase tracking-widest font-mono transition-colors ${
                !subcategorySlug 
                  ? 'bg-white text-black border-white' 
                  : 'bg-transparent text-neutral-400 border-neutral-700 hover:border-white hover:text-white'
              }`}
            >
              All {categorySlug.replace(/-/g, ' ')}
            </Link>

            {subcategories.map((subcat) => (
              <Link
                key={subcat._id}
                href={`/category/${categorySlug}/${subcat.slug?.current}`}
                className={`px-6 py-2 rounded-full border text-sm uppercase tracking-widest font-mono transition-colors ${
                  subcategorySlug === subcat.slug?.current
                    ? 'bg-white text-black border-white'
                    : 'bg-transparent text-neutral-400 border-neutral-700 hover:border-white hover:text-white'
                }`}
              >
                {subcat.title}
              </Link>
            ))}
            
          </div>
        </div>
      )}

      {/* The Gallery */}
      <section className="p-4 sm:p-8 md:p-16 max-w-[2400px] mx-auto relative z-20">
        {artworks.length > 0 ? (
          <Gallery artworks={artworks} />
        ) : (
          <div className="text-center text-neutral-500 mt-24">
            <p>No artworks found in this category.</p>
            <p className="text-sm mt-2">Upload your first artwork to this category in the Sanity Dashboard.</p>
          </div>
        )}
      </section>

    </main>
  )
}
