import { client } from '../../../../sanity/lib/client'
import Gallery from '../../../components/Gallery'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export const revalidate = 0

export async function generateMetadata({ params }) {
  const { speciesName } = await params
  const decodedSpecies = decodeURIComponent(speciesName)

  const speciesStats = await client.fetch(
    `{
      "count": count(*[_type == "artwork" && !(_id in path("drafts.**")) && lower(species) == lower($decodedSpecies) && defined(category)]),
      "venues": array::unique(*[_type == "artwork" && !(_id in path("drafts.**")) && lower(species) == lower($decodedSpecies) && defined(category)].category->title),
      "leadImageUrl": *[_type == "artwork" && !(_id in path("drafts.**")) && lower(species) == lower($decodedSpecies) && defined(category) && defined(image.asset)][0].image.asset->url
    }`,
    { decodedSpecies }
  )

  const count = speciesStats?.count || 1
  const venues = (speciesStats?.venues || []).filter(Boolean)
  const venueSummary = venues.length > 0 ? venues.slice(0, 2).join(' & ') : 'The Meadowlands'
  const canonicalPath = `/species/${encodeURIComponent(decodedSpecies)}`

  const metaTitle = `${decodedSpecies} — ${count} Fine Art Wildlife ${count === 1 ? 'Photograph' : 'Photographs'} | The Meadow Lens`
  const metaDesc = `Explore ${count} museum-grade fine art wildlife ${count === 1 ? 'photograph' : 'photographs'} of the ${decodedSpecies} captured in ${venueSummary} and the New Jersey Meadowlands (Atlantic Flyway, Exit 16W) by David McClure.`
  const keywords = [
    decodedSpecies,
    `${decodedSpecies} photography`,
    `${decodedSpecies} fine art print`,
    ...venues,
    'The Meadowlands',
    'Atlantic Flyway',
    'Exit 16W',
    'New Jersey Wildlife Photography',
    'David McClure',
    'The Meadow Lens',
  ]

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
      type: 'website',
      ...(speciesStats?.leadImageUrl ? { images: [{ url: speciesStats.leadImageUrl }] } : {}),
    },
  }
}

export default async function SpeciesPage({ params }) {
  const { speciesName } = await params
  const decodedSpecies = decodeURIComponent(speciesName)

  const artworks = await client.fetch(`*[_type == "artwork" && lower(species) == lower($decodedSpecies) && defined(category)] | order(_createdAt desc) {
    _id,
    title,
    displayTitle,
    guestPhotographer,
    caption,
    slug,
    image,
    location,
    roomSetting
  }`, { decodedSpecies })

  if (!artworks || artworks.length === 0) {
    notFound()
  }

  return (
    <main className="min-h-screen pt-6 sm:pt-8 md:pt-10 pb-12 px-4 sm:px-6 md:px-12 w-full max-w-[2000px] mx-auto">
      <div className="mb-8 sm:mb-12">
        <nav className="mb-4 sm:mb-6 text-xs sm:text-sm text-neutral-500 uppercase tracking-wider sm:tracking-widest font-mono flex flex-wrap items-center gap-y-1">
          <Link href="/bird-index" className="hover:text-white transition-colors">Species Index</Link>
          <span className="mx-2 sm:mx-3">/</span>
          <span className="text-white break-words">{decodedSpecies}</span>
        </nav>
        
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-white tracking-wide break-words">{decodedSpecies}</h1>
        <p className="text-neutral-400 mt-3 sm:mt-4 text-xs sm:text-sm uppercase tracking-widest font-mono">
          {artworks.length} {artworks.length === 1 ? 'Photograph' : 'Photographs'}
        </p>
      </div>

      <Gallery artworks={artworks} />
    </main>
  )
}
