import { client } from '../../../../sanity/lib/client'
import Gallery from '../../../components/Gallery'
import Link from 'next/link'

export const revalidate = 0 

export async function generateMetadata({ params }) {
  const { slug } = await params
  const categorySlug = slug[0]
  const subcategorySlug = slug[1]
  const currentSlug = subcategorySlug || categorySlug
  const canonicalPath = subcategorySlug ? `/category/${categorySlug}/${subcategorySlug}` : `/category/${categorySlug}`

  const query = `*[_type == "category" && slug.current == $currentSlug][0]{
    title,
    speciesDescription,
    seo,
    "parentTitle": parentCategory->title,
    "parentSlug": parentCategory->slug.current,
    "subCount": count(*[_type == "category" && !(_id in path("drafts.**")) && parentCategory._ref == ^._id]),
    "artCount": count(*[_type == "artwork" && !(_id in path("drafts.**")) && (category._ref == ^._id || subcategory._ref == ^._id || category->parentCategory._ref == ^._id)]),
    "imageUrl": coalesce(menuImage.asset->url, *[_type == "artwork" && (category._ref == ^._id || category->parentCategory._ref == ^._id) && defined(image.asset)][0].image.asset->url)
  }`
  const data = await client.fetch(query, { currentSlug })

  const title = data?.title || 'Gallery'
  const parentTitle = data?.parentTitle
  const seo = data?.seo

  const defaultTitle = parentTitle
    ? `${title} (${parentTitle} Exhibition) — Fine Art Photography | The Meadow Lens`
    : `${title} — Fine Art Photography Exhibition | The Meadow Lens`

  const defaultDesc =
    data?.speciesDescription ||
    (parentTitle
      ? `Explore the ${title} fine art photography sub-venue within the ${parentTitle} collection (${data?.artCount || 0} curated works) captured in the New Jersey Meadowlands by David McClure.`
      : `Explore the ${title} fine art photography venue (${data?.subCount ? `${data.subCount} sub-venues, ` : ''}${data?.artCount || 0} curated photographs) captured along Exit 16W of the Atlantic Flyway by David McClure.`)

  const metaTitle = seo?.metaTitle || defaultTitle
  const metaDesc = seo?.metaDescription || defaultDesc
  const keywords =
    seo?.keywords?.length > 0
      ? seo.keywords
      : Array.from(
          new Set(
            [
              title,
              `${title} Photography`,
              `${title} Fine Art Prints`,
              parentTitle,
              parentTitle && `${parentTitle} ${title}`,
              'The Meadowlands',
              'Atlantic Flyway',
              'Exit 16W',
              'New Jersey Nature Photography',
              'David McClure',
              'The Meadow Lens',
            ].filter(Boolean)
          )
        )

  return {
    title: metaTitle,
    description: metaDesc,
    keywords,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: metaTitle,
      description: metaDesc,
      url: canonicalPath,
      ...(data?.imageUrl ? { images: [{ url: data.imageUrl, alt: title }] } : {}),
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

  const isRootWithSubvenues = !subcategorySlug && subcategories.length > 0

  const groqConditions = `_type == "artwork" && !(_id in path("drafts.**")) && (category->slug.current == $currentSlug || subcategory->slug.current == $currentSlug)`
  const artworksQuery = `*[${groqConditions}] | order(_createdAt desc) {
    ...,
    "imageUrl": image.asset->url
  }`
  
  let artworks = []
  if (category && !isRootWithSubvenues) {
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
    <main className="min-h-screen bg-neutral-950 pt-6 sm:pt-8 md:pt-10 pb-16 sm:pb-24 px-4 sm:px-6 md:px-12 w-full max-w-[2000px] mx-auto">
      
      <section className="px-2 sm:px-6 md:px-12 text-center mb-10 sm:mb-14">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white font-light tracking-wide mb-3 sm:mb-4 break-words">
          {category.title}
        </h1>
        {category.speciesDescription && (
          <p className="text-neutral-400 font-light text-sm sm:text-base md:text-lg max-w-3xl mx-auto mt-3 sm:mt-4 leading-relaxed">
            {category.speciesDescription}
          </p>
        )}
        {currentSlug === 'guest-photos' && (
          <div className="mt-4 inline-block px-4 py-1.5 bg-emerald-950/40 border border-emerald-500/30 rounded-full">
            <span className="text-emerald-300 uppercase tracking-widest text-[11px] sm:text-xs font-mono">
              Curated By Invitation Only
            </span>
          </div>
        )}
        {subcategorySlug && (
          <div className="mt-4">
            <Link href={`/category/${categorySlug}`} className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-neutral-900 border border-white/10 text-xs sm:text-sm text-neutral-300 hover:text-white uppercase tracking-widest font-mono transition-colors">
              &larr; Back to {categorySlug.replace(/-/g, ' ')}
            </Link>
          </div>
        )}
      </section>

      {subcategories.length > 0 && (
        <section className="px-0 sm:px-4 md:px-12 max-w-[2400px] mx-auto mb-14 sm:mb-20">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
            {subcategories.map(sub => (
              <Link 
                key={sub._id}
                href={`/category/${categorySlug}/${sub.slug.current}`}
                className="group relative aspect-square overflow-hidden bg-neutral-900 block rounded-sm border border-white/10"
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 opacity-75 group-hover:opacity-100"
                  style={{ backgroundImage: `url('${sub.imageUrl || ""}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent opacity-85 group-hover:opacity-65 transition-opacity duration-500" />
                <div className="absolute inset-0 flex items-end justify-center p-2.5 sm:p-4 md:p-6 pb-3.5 sm:pb-6 md:pb-8">
                  <h3 className="text-[11px] xs:text-xs sm:text-sm md:text-base text-white font-semibold tracking-wider sm:tracking-widest uppercase text-center drop-shadow-md leading-snug line-clamp-3">
                    {sub.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {artworks.length > 0 && (
        <section className="px-0 sm:px-4 md:px-12 max-w-[2400px] mx-auto relative z-20 border-t border-white/5 pt-8 sm:pt-16">
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
