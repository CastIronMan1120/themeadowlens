import { client } from '../../../../sanity/lib/client'
import Gallery from '../../../components/Gallery'
import Link from 'next/link'

export const revalidate = 0 

export async function generateMetadata({ params }) {
  const { slug } = await params
  const categorySlug = slug[0]
  const subcategorySlug = slug[1]
  const currentSlug = subcategorySlug || categorySlug

  const query = `*[_type == "category" && slug.current == $currentSlug][0]{
    title,
    speciesDescription,
    seo,
    "imageUrl": coalesce(menuImage.asset->url, *[_type == "artwork" && (category._ref == ^._id || category->parentCategory._ref == ^._id) && defined(image.asset)][0].image.asset->url)
  }`
  const data = await client.fetch(query, { currentSlug })

  const title = data?.title || "Gallery"
  const seo = data?.seo

  const metaTitle = seo?.metaTitle || `${title} | The Meadow Lens`
  const metaDesc = seo?.metaDescription || data?.speciesDescription || `Explore the ${title} fine art photography collection by David McClure.`
  const keywords = seo?.keywords?.length > 0 ? seo.keywords : [title, "Fine Art Photography", "The Meadowlands", "Nature Photography", "David McClure", "Gallery", "Exhibition"]

  return {
    title: metaTitle,
    description: metaDesc,
    keywords: keywords,
    openGraph: {
      title: metaTitle,
      description: metaDesc,
      ...(data?.imageUrl ? { images: [{ url: data.imageUrl }] } : {}),
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
    "imageUrl": coalesce(menuImage.asset->url, *[_type == "artwork" && (category._ref == ^._id || subcategory._ref == ^._id) && defined(image.asset)][0].image.asset->url)
  }`
  const subcategories = await client.fetch(subcategoriesQuery, { currentSlug })

  const groqConditions = `_type == "artwork" && (category->slug.current == $currentSlug || subcategory->slug.current == $currentSlug || category->parentCategory->slug.current == $currentSlug)`
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
    <main className="min-h-screen bg-neutral-950 pt-40 md:pt-[240px] pb-24 px-6 md:px-12 w-full max-w-[2000px] mx-auto">
      
      <section className="px-6 md:px-12 text-center mb-16">
        <h1 className="text-4xl md:text-6xl lg:text-7xl text-white font-light tracking-tight mb-4">
          {category.title}
        </h1>
        {category.speciesDescription && (
          <p className="text-neutral-400 font-light text-base md:text-lg max-w-3xl mx-auto mt-4 leading-relaxed">
            {category.speciesDescription}
          </p>
        )}
        {currentSlug === 'guest-photos' && (
          <div className="mt-4 inline-block px-4 py-1.5 bg-emerald-950/40 border border-emerald-500/30 rounded-full">
            <span className="text-emerald-300 uppercase tracking-widest text-xs font-mono">
              Curated By Invitation Only
            </span>
          </div>
        )}
        {subcategorySlug && (
          <div className="mt-4">
            <Link href={`/category/${categorySlug}`} className="text-sm text-neutral-500 hover:text-white uppercase tracking-widest font-mono transition-colors">
              &larr; Back to {categorySlug.replace('-', ' ')}
            </Link>
          </div>
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
