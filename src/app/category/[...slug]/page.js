import { client } from '../../../sanity/lib/client'
import Gallery from '../../components/Gallery'
import Link from 'next/link'

export const revalidate = 0 

export async function generateMetadata({ params }) {
  const { slug } = await params
  const categorySlug = slug[0]
  const subcategorySlug = slug[1]

  let title = "Gallery"
  let seo = null
  
  if (subcategorySlug) {
    const query = `*[_type == "category" && slug.current == $subcategorySlug][0]`
    const data = await client.fetch(query, { subcategorySlug })
    if (data?.title) title = data.title
    if (data?.seo) seo = data.seo
  } else {
    const query = `*[_type == "category" && slug.current == $categorySlug][0]`
    const data = await client.fetch(query, { categorySlug })
    if (data?.title) title = data.title
    if (data?.seo) seo = data.seo
  }

  const metaTitle = seo?.metaTitle || `${title} | The Meadow Lens`
  const metaDesc = seo?.metaDescription || `Explore the ${title} fine art photography collection by David McClure.`
  const keywords = seo?.keywords?.length > 0 ? seo.keywords : [title, "Fine Art Photography", "The Meadowlands", "Nature Photography", "David McClure", "Gallery", "Exhibition"]

  return {
    title: metaTitle,
    description: metaDesc,
    keywords: keywords,
    openGraph: {
      title: metaTitle,
      description: metaDesc,
      type: 'website',
    },
  }
}

export default async function CategoryPage({ params }) {
  const { slug } = await params
  const categorySlug = slug[0]
  const subcategorySlug = slug[1]

  const currentSlug = subcategorySlug || categorySlug
  
  const categoryQuery = `*[_type == "category" && slug.current == $currentSlug][0]`
  const category = await client.fetch(categoryQuery, { currentSlug })

  const subcategoriesQuery = `*[_type == "category" && parentCategory->slug.current == $currentSlug] | order(title asc) {
    _id,
    title,
    slug,
    "imageUrl": menuImage.asset->url
  }`
  const subcategories = await client.fetch(subcategoriesQuery, { currentSlug })

  const groqConditions = `_type == "artwork" && (category->slug.current == $currentSlug || subcategory->slug.current == $currentSlug)`
  const artworksQuery = `*[${groqConditions}] | order(_createdAt desc) {
    ...,
    "imageUrl": image.asset->url
  }`
  
  let artworks = []
  if (category) {
    artworks = await client.fetch(artworksQuery, { currentSlug })
  }

  if (!category) {
    return (
      <main className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-8">
        <h1 className="text-4xl text-white mb-4">Venue Not Found</h1>
        <Link href="/" className="text-neutral-400 hover:text-white underline">Return to Directory</Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-neutral-950 pt-56 pb-24 px-6 md:px-12 w-full max-w-[2000px] mx-auto">
      
      <section className="px-6 md:px-12 text-center mb-16">
        <h1 className="text-4xl md:text-6xl lg:text-7xl text-white font-light tracking-tight mb-4">
          {category.title}
        </h1>
        {subcategorySlug && (
          <Link href={`/category/${categorySlug}`} className="text-sm text-neutral-500 hover:text-white uppercase tracking-widest font-mono transition-colors">
            &larr; Back to {categorySlug.replace('-', ' ')}
          </Link>
        )}
      </section>

      {subcategories.length > 0 && (
        <section className="px-4 sm:px-8 md:px-16 max-w-[2400px] mx-auto mb-20">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {subcategories.map(sub => (
              <Link 
                key={sub._id}
                href={`/category/${categorySlug}/${sub.slug.current}`}
                className="group relative aspect-square overflow-hidden bg-neutral-900 block rounded-sm border border-white/5"
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100"
                  style={{ backgroundImage: `url('${sub.imageUrl || ""}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />
                <div className="absolute inset-0 flex items-end justify-center p-4 md:p-6 pb-6 md:pb-8">
                  <h3 className="text-sm md:text-base text-white font-semibold tracking-widest uppercase text-center drop-shadow-md">
                    {sub.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {artworks.length > 0 && (
        <section className="p-4 sm:p-8 md:p-16 max-w-[2400px] mx-auto relative z-20 border-t border-white/5 pt-16">
          <Gallery artworks={artworks} fallbackDescription={category.speciesDescription} />
        </section>
      )}
      
      {artworks.length === 0 && subcategories.length === 0 && (
         <div className="text-center text-neutral-500 mt-24">
           <p>There are currently no artworks in this venue.</p>
         </div>
      )}

    </main>
  )
}
