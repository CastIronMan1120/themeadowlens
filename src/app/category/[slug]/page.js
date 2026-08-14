import { client } from '../../../sanity/lib/client'
import Gallery from '../../components/Gallery'
import Link from 'next/link'

export const revalidate = 0 

export default async function CategoryPage({ params }) {
  const { slug } = await params

  // 1. Fetch the specific category to get its title
  const categoryQuery = `*[_type == "category" && slug.current == $slug][0]`
  const category = await client.fetch(categoryQuery, { slug })

  if (!category) {
    return (
      <main className="min-h-screen bg-black pt-32 px-8 flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl text-white mb-6">Category Not Found</h1>
        <Link href="/" className="text-neutral-400 hover:text-white border border-neutral-700 px-6 py-2 rounded-full uppercase tracking-widest text-sm">
          Return to Exhibition
        </Link>
      </main>
    )
  }

  // 2. Fetch artworks that reference this category OR reference a subcategory that belongs to this category
  const artworksQuery = `*[_type == "artwork" && (category->slug.current == $slug || subcategory->slug.current == $slug)] | order(_createdAt desc)`
  const artworks = await client.fetch(artworksQuery, { slug })

  return (
    <main className="min-h-screen bg-neutral-950">
      
      {/* Category Header */}
      <section className="pt-40 pb-16 px-6 md:px-12 text-center">
        <h1 className="text-5xl md:text-7xl lg:text-8xl text-white font-light tracking-tight mb-6">
          {category.title}
        </h1>
        <p className="text-xl text-neutral-400 font-mono tracking-widest uppercase">
          Curated Collection
        </p>
      </section>

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
