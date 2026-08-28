import { client } from '../../../sanity/lib/client'
import Gallery from '../../components/Gallery'
import FilterBar from '../../components/FilterBar'
import Link from 'next/link'

export const revalidate = 0 

// 1. Dynamic SEO Metadata Generation
export async function generateMetadata({ params }) {
  const { slug } = await params
  const categorySlug = slug[0]
  const subcategorySlug = slug[1]

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
    keywords: [title, "Fine Art Photography", "The Meadowlands", "Nature Photography", "David McClure", "Gallery", "Exhibition"],
    openGraph: {
      title: `${title} | The Meadow Lens`,
      description: `Explore the ${title} fine art photography collection by David McClure.`,
      type: 'website',
    },
  }
}

export default async function CategoryPage({ params, searchParams }) {
  const { slug } = await params
  const resolvedSearchParams = await searchParams
  
  const categorySlug = slug[0]
  const subcategorySlug = slug[1]

  const species = resolvedSearchParams?.species || ''
  const color = resolvedSearchParams?.color || ''
  const size = resolvedSearchParams?.size || ''

  // Fetch the current category (or subcategory) to get its title
  const currentSlug = subcategorySlug || categorySlug
  const categoryQuery = `*[_type == "category" && slug.current == $currentSlug][0]`
  const category = await client.fetch(categoryQuery, { currentSlug })

  // Fetch sibling subcategories for the Filter Menu
  const parentSlugToQuery = subcategorySlug ? categorySlug : categorySlug
  const subcategoriesQuery = `*[_type == "category" && parentCategory->slug.current == $parentSlugToQuery] | order(title asc)`
  const subcategories = await client.fetch(subcategoriesQuery, { parentSlugToQuery })

  // Build the dynamic GROQ query based on URL parameters
  let groqConditions = `_type == "artwork" && (category->slug.current == $currentSlug || subcategory->slug.current == $currentSlug)`
  if (species) groqConditions += ` && species == $species`
  if (color) groqConditions += ` && dominantColor == $color`
  if (size) groqConditions += ` && size == $size`

  const artworksQuery = `*[${groqConditions}] | order(_createdAt desc) {
    ...,
    "imageUrl": image.asset->url
  }`
  
  let artworks = []
  let allCategoryArtworks = [] // Unfiltered list to extract available filter options

  if (category) {
    artworks = await client.fetch(artworksQuery, { currentSlug, species, color, size })
    
    // Fetch all artworks in this category to get the available filter options
    const allArtworksQuery = `*[_type == "artwork" && (category->slug.current == $currentSlug || subcategory->slug.current == $currentSlug)]`
    allCategoryArtworks = await client.fetch(allArtworksQuery, { currentSlug })
  }

  // Extract unique filter options from the unfiltered artworks list
  const availableSpecies = [...new Set(allCategoryArtworks.map(a => a.species).filter(Boolean))].sort()
  const availableColors = [...new Set(allCategoryArtworks.map(a => a.dominantColor).filter(Boolean))].sort()
  const availableSizes = [...new Set(allCategoryArtworks.map(a => a.size).filter(Boolean))].sort()

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
              { id: 1, title: "Legacy Photograph 1", loc: "The Meadowlands", img: "https://d15yhgn2ui21mw.cloudfront.net/production/27828/MDAwMDAwMDAwMDAw7QGraePd6CACehR_ZcfBFYwXu2FyveAYEUnRGwCTQQQLtneRwWETeR6yOMFIOjy24aDow_LJj7F22f2vd2S3k0FN_38EZqodfTc2xEuhDJufAHDziomoKXOdJ3Hs_jG_Da6jI5Eudq_OlWAGPJ5eMn5GdWubauzcA36GcgRY1fWMRXAyI_kns64GDLOzMbtDhp4MzfALcUQj-6GhUPrzz2cP26jvMuXkEAQK9UuhPaFh6sZ0WiHUxvwkfo0iBUIvrtzbVMJOQCKJtixHhM2uAFAzJqp3tkw9CK1Q-UUQdYf17tBc8FtuRPZjA0HS8f5UQNMgYWf3w4K_o-rz34O8o0_KFsf5lFPtzMsdvKDrF20U_Yv9QZ62UCQwOpCzcYBMuUz2OSK6lNEue5NbDJrMm6IGoPAHiyZ5_g61_8NiomtEwYlgpUDMZK8TyFQcauOrq_vNZrrN3XuD-pTFsS_tRZSwoQhWGDTxkzfRjWOFZqNs5sSydA.jpg" },
              { id: 2, title: "Legacy Photograph 2", loc: "The Meadowlands", img: "https://d15yhgn2ui21mw.cloudfront.net/production/27828/MDAwMDAwMDAwMDAw7QGraePd6CACehR_ZcfBFYwXu2FyveAYEUnRGwCTQQQLtneRwWETeR6yOMFIOjy24aDow_LJj7F22f2vd2S3k0FN_38EZqodfTc2xEuhDJufAHDziomoKXOdJ3Hs_jG_Da6jI5Eudq_OlWAGPJ5eMn5SVizHNoqjVGKBfhUP58mXRnMzJf0jqt1SUen0BLgI3pE92_gRXVg-6LuoU7ytliAZ0MakIbKhUR5YqEvrdqExp4pvWSfBw-lyLdR8Rkw3gs6dRsUeF3XNpGs4k8D_awBPQVsnmE08y6oKQQw.jpg" },
              { id: 3, title: "Legacy Photograph 3", loc: "The Meadowlands", img: "https://d15yhgn2ui21mw.cloudfront.net/production/27828/MDAwMDAwMDAwMDAw7QGraePd6CACehR_ZcfBFYwXu2FyveAYEUnRGwCTQQQLtneRwWETeR6yOMFIOjy24aDow_LJj7F22f2vd2S3k0FN_38EZqodfTc2xEuhDJufAHDziomoKXOdJ3Hs_jG_Da6jI5Eudq_OlWAGPJ5eMn5PZkKTYNfOLU-ZWDVc-MHRGSVpSY148ocDAqLBRu8Ywuwrm6kcGFR-q-H9EuD3zGMO2rO1c7bxEkwO4AjjbLN8-cVmSCfJxe5yLbk3VANnmtfbCI9aRDffuDQNi9SuSggzbekm6glrBuYOr0xHO97_vMhy-UDxctCtn6KlE1Vjrc-SXIQ.jpg" },
              { id: 4, title: "Legacy Photograph 4", loc: "The Meadowlands", img: "https://d15yhgn2ui21mw.cloudfront.net/production/27828/MDAwMDAwMDAwMDAw7QGraePd6CACehR_ZcfBFYwXu2FyveAYEUnRGwCTQQQLtneRwWETeR6yOMFIOjy24aDow_LJj7F22f2vd2S3k0FN_38EZqodfTc2xEuhDJufAHDziomoKXOdJ3Hs_jG_Da6jI5Eudq_OlWAGPJ5eMn5SVi3KOYOmUxCvYx9J1cDfA3d8cuEmqd1QU_GqQOcb3Nk5zrtTDEoj-7i6QbqwlTJPg_KxcPPpZRVY8Rvib_cpqc5uSGyKifU1foUkAkIvw5fJHo9LRCeJ_DRf2I35XyFsCQjubf2j8jXRQoT4o-hBPA.jpg" },
              { id: 5, title: "Legacy Photograph 5", loc: "The Meadowlands", img: "https://d15yhgn2ui21mw.cloudfront.net/production/27828/MDAwMDAwMDAwMDAw7QGraePd6CACehR_ZcfBFYwXu2FyveAYEUnRGwCTQQQLtneRwWETeR6yOMFIOjy24aDow_LJj7F22f2vd2S3k0FN_38EZqodfTc2xEuhDJufAHDziomoKXOdJ3Hs_jG_Da6jI5Eudq_OlWAGPJ5eMn5SJSzKNoCoUUqHKjNZ49HnFix3JKZ5sdpVU_-pTewcwYdnw-kYDBJz7qSoSaaklyFWi-m2bL-gHFQh6UvubbpjqZIlWifSibFyf4clEQhh153PAp0QDzSU8GINzIf_EkxsCqKJ8TV1jKcI2es-mAz9Y4av.jpg" },
              { id: 6, title: "Legacy Photograph 6", loc: "The Meadowlands", img: "https://d15yhgn2ui21mw.cloudfront.net/production/27828/MDAwMDAwMDAwMDAw7QGraePd6CACehR_ZcfBFYwXu2FyveAYEUnRGwCTQQQLtneRwWETeR6yOMFIOjy24aDow_LJj7F22f2vd2S3k0FN_38EZqodfTc2xEuhDJufAHDziomoKXOdJ3Hs_jG_Da6jI5Eudq_OlWAGPJ5eMn5nbnTAftHkGk-JfRFT8MyOHydie-Emqd9WVPKvRu0Y3MMnzrtTDEoj-7i6QbqwlTJPg" },
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
        <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-8 md:px-16 mb-4 border-b border-white/10 pb-8">
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

      {/* Dynamic Metadata Filters (Species, Color, Size) */}
      <FilterBar 
        availableSpecies={availableSpecies} 
        availableColors={availableColors} 
        availableSizes={availableSizes} 
      />

      {/* The Gallery */}
      <section className="p-4 sm:p-8 md:p-16 max-w-[2400px] mx-auto relative z-20">
        {artworks.length > 0 ? (
          <Gallery artworks={artworks} />
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-12 space-y-12 mt-12">
            {[
              { id: 1, title: "Legacy Photograph 1", loc: "The Meadowlands", img: "https://d15yhgn2ui21mw.cloudfront.net/production/27828/MDAwMDAwMDAwMDAw7QGraePd6CACehR_ZcfBFYwXu2FyveAYEUnRGwCTQQQLtneRwWETeR6yOMFIOjy24aDow_LJj7F22f2vd2S3k0FN_38EZqodfTc2xEuhDJufAHDziomoKXOdJ3Hs_jG_Da6jI5Eudq_OlWAGPJ5eMn5GdWubauzcA36GcgRY1fWMRXAyI_kns64GDLOzMbtDhp4MzfALcUQj-6GhUPrzz2cP26jvMuXkEAQK9UuhPaFh6sZ0WiHUxvwkfo0iBUIvrtzbVMJOQCKJtixHhM2uAFAzJqp3tkw9CK1Q-UUQdYf17tBc8FtuRPZjA0HS8f5UQNMgYWf3w4K_o-rz34O8o0_KFsf5lFPtzMsdvKDrF20U_Yv9QZ62UCQwOpCzcYBMuUz2OSK6lNEue5NbDJrMm6IGoPAHiyZ5_g61_8NiomtEwYlgpUDMZK8TyFQcauOrq_vNZrrN3XuD-pTFsS_tRZSwoQhWGDTxkzfRjWOFZqNs5sSydA.jpg" },
              { id: 2, title: "Legacy Photograph 2", loc: "The Meadowlands", img: "https://d15yhgn2ui21mw.cloudfront.net/production/27828/MDAwMDAwMDAwMDAw7QGraePd6CACehR_ZcfBFYwXu2FyveAYEUnRGwCTQQQLtneRwWETeR6yOMFIOjy24aDow_LJj7F22f2vd2S3k0FN_38EZqodfTc2xEuhDJufAHDziomoKXOdJ3Hs_jG_Da6jI5Eudq_OlWAGPJ5eMn5SVizHNoqjVGKBfhUP58mXRnMzJf0jqt1SUen0BLgI3pE92_gRXVg-6LuoU7ytliAZ0MakIbKhUR5YqEvrdqExp4pvWSfBw-lyLdR8Rkw3gs6dRsUeF3XNpGs4k8D_awBPQVsnmE08y6oKQQw.jpg" },
              { id: 3, title: "Legacy Photograph 3", loc: "The Meadowlands", img: "https://d15yhgn2ui21mw.cloudfront.net/production/27828/MDAwMDAwMDAwMDAw7QGraePd6CACehR_ZcfBFYwXu2FyveAYEUnRGwCTQQQLtneRwWETeR6yOMFIOjy24aDow_LJj7F22f2vd2S3k0FN_38EZqodfTc2xEuhDJufAHDziomoKXOdJ3Hs_jG_Da6jI5Eudq_OlWAGPJ5eMn5PZkKTYNfOLU-ZWDVc-MHRGSVpSY148ocDAqLBRu8Ywuwrm6kcGFR-q-H9EuD3zGMO2rO1c7bxEkwO4AjjbLN8-cVmSCfJxe5yLbk3VANnmtfbCI9aRDffuDQNi9SuSggzbekm6glrBuYOr0xHO97_vMhy-UDxctCtn6KlE1Vjrc-SXIQ.jpg" },
              { id: 4, title: "Legacy Photograph 4", loc: "The Meadowlands", img: "https://d15yhgn2ui21mw.cloudfront.net/production/27828/MDAwMDAwMDAwMDAw7QGraePd6CACehR_ZcfBFYwXu2FyveAYEUnRGwCTQQQLtneRwWETeR6yOMFIOjy24aDow_LJj7F22f2vd2S3k0FN_38EZqodfTc2xEuhDJufAHDziomoKXOdJ3Hs_jG_Da6jI5Eudq_OlWAGPJ5eMn5SVi3KOYOmUxCvYx9J1cDfA3d8cuEmqd1QU_GqQOcb3Nk5zrtTDEoj-7i6QbqwlTJPg_KxcPPpZRVY8Rvib_cpqc5uSGyKifU1foUkAkIvw5fJHo9LRCeJ_DRf2I35XyFsCQjubf2j8jXRQoT4o-hBPA.jpg" },
              { id: 5, title: "Legacy Photograph 5", loc: "The Meadowlands", img: "https://d15yhgn2ui21mw.cloudfront.net/production/27828/MDAwMDAwMDAwMDAw7QGraePd6CACehR_ZcfBFYwXu2FyveAYEUnRGwCTQQQLtneRwWETeR6yOMFIOjy24aDow_LJj7F22f2vd2S3k0FN_38EZqodfTc2xEuhDJufAHDziomoKXOdJ3Hs_jG_Da6jI5Eudq_OlWAGPJ5eMn5SJSzKNoCoUUqHKjNZ49HnFix3JKZ5sdpVU_-pTewcwYdnw-kYDBJz7qSoSaaklyFWi-m2bL-gHFQh6UvubbpjqZIlWifSibFyf4clEQhh153PAp0QDzSU8GINzIf_EkxsCqKJ8TV1jKcI2es-mAz9Y4av.jpg" },
              { id: 6, title: "Legacy Photograph 6", loc: "The Meadowlands", img: "https://d15yhgn2ui21mw.cloudfront.net/production/27828/MDAwMDAwMDAwMDAw7QGraePd6CACehR_ZcfBFYwXu2FyveAYEUnRGwCTQQQLtneRwWETeR6yOMFIOjy24aDow_LJj7F22f2vd2S3k0FN_38EZqodfTc2xEuhDJufAHDziomoKXOdJ3Hs_jG_Da6jI5Eudq_OlWAGPJ5eMn5nbnTAftHkGk-JfRFT8MyOHydie-Emqd9WVPKvRu0Y3MMnzrtTDEoj-7i6QbqwlTJPg" },
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
            <div className="col-span-full text-center text-neutral-500 mt-12 border-t border-white/5 pt-12">
              <p>These are preview images. Upload real artworks to this category in the Sanity Dashboard to replace them.</p>
            </div>
          </div>
        )}
      </section>

    </main>
  )
}
