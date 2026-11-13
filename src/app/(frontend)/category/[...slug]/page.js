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
  
  const categoryQuery = `*[_type == "category" && slug.current == $currentSlug] | order(_updatedAt desc)[0]`
  const category = await client.fetch(categoryQuery, { currentSlug })

  const subcategoriesQuery = `*[_type == "category" && parentCategory->slug.current == $currentSlug] {
    _id,
    title,
    slug,
    sortOrder,
    "imageUrl": coalesce(menuImage.asset->url, *[_type == "artwork" && (category._ref == ^._id || subcategory._ref == ^._id) && defined(image.asset)][0].image.asset->url)
  }`
  const rawSubcategories = await client.fetch(subcategoriesQuery, { currentSlug })
  const subcategories = [...(rawSubcategories || [])].sort((a, b) => {
    const orderA = typeof a.sortOrder === 'number' && !Number.isNaN(a.sortOrder) ? a.sortOrder : 9999
    const orderB = typeof b.sortOrder === 'number' && !Number.isNaN(b.sortOrder) ? b.sortOrder : 9999
    if (orderA !== orderB) return orderA - orderB
    return (a.title || '').localeCompare(b.title || '', undefined, { numeric: true, sensitivity: 'base' })
  })

  const isRootWithSubvenues = !subcategorySlug && subcategories.length > 0

  const groqConditions = `_type == "artwork" && !(_id in path("drafts.**")) && (category->slug.current == $currentSlug || subcategory->slug.current == $currentSlug)`
  const artworksQuery = `*[${groqConditions}] | order(_createdAt desc) {
    ...,
    "imageUrl": image.asset->url
  }`
  
  let artworks = []
  if (category && !isRootWithSubvenues) {
    artworks = await client.fetch(artworksQuery, { currentSlug })
    if (category.alphabetizeBySpecies && Array.isArray(artworks)) {
      artworks = [...artworks].sort((a, b) => {
        const speciesA = (a.species || a.displayTitle || a.title || '').trim()
        const speciesB = (b.species || b.displayTitle || b.title || '').trim()
        const cmp = speciesA.localeCompare(speciesB, undefined, { numeric: true, sensitivity: 'base' })
        if (cmp !== 0) return cmp
        const titleA = (a.displayTitle || a.title || '').trim()
        const titleB = (b.displayTitle || b.title || '').trim()
        const titleCmp = titleA.localeCompare(titleB, undefined, { numeric: true, sensitivity: 'base' })
        if (titleCmp !== 0) return titleCmp
        return (a.fileName || '').localeCompare(b.fileName || '', undefined, { numeric: true, sensitivity: 'base' })
      })
    }
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
    <main className="min-h-screen bg-neutral-950 pt-4 sm:pt-8 md:pt-10 pb-16 sm:pb-24 px-3.5 sm:px-6 md:px-12 w-full max-w-[2000px] mx-auto">
      
      <section className="px-1 sm:px-6 md:px-12 text-center mb-7 sm:mb-12 md:mb-14">
        <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white font-light tracking-wide mb-2.5 sm:mb-4 break-words leading-snug">
          {category.title}
        </h1>
        {category.speciesDescription && (
          <p className="text-neutral-400 font-light text-xs xs:text-sm sm:text-base md:text-lg max-w-3xl mx-auto mt-2.5 sm:mt-4 leading-relaxed">
            {category.speciesDescription}
          </p>
        )}
        {currentSlug === 'guest-photos' && (
          <div className="mt-3.5 sm:mt-4 inline-block px-3.5 sm:px-4 py-1 sm:py-1.5 bg-emerald-950/40 border border-emerald-500/30 rounded-full">
            <span className="text-emerald-300 uppercase tracking-widest text-[10px] sm:text-xs font-mono">
              Curated By Invitation Only
            </span>
          </div>
        )}
        {subcategorySlug && (
          <div className="mt-3.5 sm:mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <Link href={`/category/${categorySlug}`} className="inline-flex items-center min-h-[36px] px-3 sm:px-3.5 py-1.5 rounded-full bg-neutral-900 border border-white/15 text-[11px] sm:text-sm text-neutral-200 hover:text-white uppercase tracking-wider sm:tracking-widest font-mono transition-colors">
              &larr; Back to {categorySlug.replace(/-/g, ' ')}
            </Link>
            {category.alphabetizeBySpecies && (
              <span className="inline-flex items-center min-h-[36px] px-3 sm:px-3.5 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-[10px] sm:text-xs text-emerald-300 uppercase tracking-wider sm:tracking-widest font-mono">
                Alphabetical by Species (A&ndash;Z)
              </span>
            )}
          </div>
        )}
        {!subcategorySlug && category.alphabetizeBySpecies && (
          <div className="mt-3.5 sm:mt-4">
            <span className="inline-flex items-center min-h-[36px] px-3 sm:px-3.5 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-[10px] sm:text-xs text-emerald-300 uppercase tracking-wider sm:tracking-widest font-mono">
              Alphabetical by Species (A&ndash;Z)
            </span>
          </div>
        )}
      </section>

      {subcategories.length > 0 && (
        <section className="px-0 sm:px-4 md:px-12 max-w-[2400px] mx-auto mb-12 sm:mb-20">
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-4 md:gap-6">
            {subcategories.map(sub => (
              <Link 
                key={sub._id}
                href={`/category/${categorySlug}/${sub.slug.current}`}
                className="group relative aspect-[4/3] xs:aspect-square overflow-hidden bg-neutral-900 block rounded-sm border border-white/15 hover:border-white/30 transition-colors"
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 opacity-85 group-hover:opacity-100"
                  style={{ backgroundImage: `url('${sub.imageUrl || ""}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-90 group-hover:opacity-70 transition-opacity duration-500" />
                <div className="absolute inset-0 flex items-end justify-center p-2.5 sm:p-4 md:p-6 pb-3 sm:pb-6 md:pb-8">
                  <h3 className="text-xs sm:text-sm md:text-base text-white font-semibold tracking-wide sm:tracking-widest uppercase text-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] leading-snug line-clamp-3">
                    {sub.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {artworks.length > 0 && (
        <section className="px-0 sm:px-4 md:px-12 max-w-[2400px] mx-auto relative z-20 border-t border-white/5 pt-6 sm:pt-14">
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
