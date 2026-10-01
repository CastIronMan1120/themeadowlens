import { client } from '../../../sanity/lib/client'
import Gallery from '../../components/Gallery'
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

  const artworks = await client.fetch(`*[_type == "artwork" && species == $decodedSpecies] | order(_createdAt desc) {
    _id,
    title,
    displayTitle,
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
    <main className="min-h-screen pt-48 pb-12 px-6 md:px-12 max-w-[2000px] mx-auto">
      <div className="mb-12">
        <nav className="mb-6 text-sm text-neutral-500 uppercase tracking-widest font-mono flex items-center">
          <Link href="/bird-index" className="hover:text-white transition-colors">Species Index</Link>
          <span className="mx-3">/</span>
          <span className="text-white">{decodedSpecies}</span>
        </nav>
        
        <h1 className="text-5xl md:text-6xl font-light text-white tracking-wide">{decodedSpecies}</h1>
        <p className="text-neutral-400 mt-4 text-sm uppercase tracking-widest font-mono">
          {artworks.length} {artworks.length === 1 ? 'Photograph' : 'Photographs'}
        </p>
      </div>

      <Gallery artworks={artworks} />
    </main>
  )
}
