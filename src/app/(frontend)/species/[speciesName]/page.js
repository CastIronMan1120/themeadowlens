import { client } from '../../../../sanity/lib/client'
import Gallery from '../../../components/Gallery'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export const revalidate = 0

export async function generateMetadata({ params }) {
  const { speciesName } = await params
  const decodedSpecies = decodeURIComponent(speciesName)
  return {
    title: `${decodedSpecies} Photography | The Meadow Lens`,
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
    <main className="min-h-screen pt-32 sm:pt-40 md:pt-[240px] pb-12 px-4 sm:px-6 md:px-12 w-full max-w-[2000px] mx-auto">
      <div className="mb-8 sm:mb-12">
        <nav className="mb-4 sm:mb-6 text-xs sm:text-sm text-neutral-500 uppercase tracking-wider sm:tracking-widest font-mono flex flex-wrap items-center gap-y-1">
          <Link href="/bird-index" className="hover:text-white transition-colors">Species Index</Link>
          <span className="mx-2 sm:mx-3">/</span>
          <span className="text-white break-words">{decodedSpecies}</span>
        </nav>
        
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-light text-white tracking-wide break-words">{decodedSpecies}</h1>
        <p className="text-neutral-400 mt-3 sm:mt-4 text-xs sm:text-sm uppercase tracking-widest font-mono">
          {artworks.length} {artworks.length === 1 ? 'Photograph' : 'Photographs'}
        </p>
      </div>

      <Gallery artworks={artworks} />
    </main>
  )
}
