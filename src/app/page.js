import { client } from '../sanity/lib/client'
import Gallery from './components/Gallery'

export const revalidate = 0 // Disable caching for now to see instant updates

export default async function Home() {
  // Fetch all artworks from Sanity
  const query = `*[_type == "artwork"] | order(_createdAt desc)`
  const artworks = await client.fetch(query)

  return (
    <main className="min-h-screen p-8 sm:p-12 md:p-24 max-w-[1800px] mx-auto">
      <header className="mb-16 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl tracking-tight mb-4 text-white">The Meadow Lens</h1>
        <p className="text-lg md:text-xl text-neutral-400 font-light">
          Naturally!
        </p>
      </header>

      {artworks.length > 0 ? (
        <Gallery artworks={artworks} />
      ) : (
        <div className="text-center text-neutral-500 mt-24">
          <p>The gallery is currently empty.</p>
          <p className="text-sm mt-2">Upload your first artwork in the Sanity Dashboard to see it here.</p>
        </div>
      )}
    </main>
  )
}
