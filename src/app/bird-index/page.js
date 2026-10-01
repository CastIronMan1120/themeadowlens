import { client } from '../../sanity/lib/client'
import Link from 'next/link'

export const revalidate = 0

export const metadata = {
  title: 'Bird Index | The Meadow Lens',
  description: 'An alphabetical encyclopedia of bird species photographed by David McClure.'
}

export default async function BirdIndexPage() {
  // Fetch all defined species from the database
  const rawSpecies = await client.fetch(`*[_type == "artwork" && defined(species)].species`)
  
  // Deduplicate and sort alphabetically
  const uniqueSpecies = [...new Set(rawSpecies)].sort((a, b) => a.localeCompare(b))

  // Group by first letter for the glossary layout
  const groupedSpecies = uniqueSpecies.reduce((acc, species) => {
    const letter = species.charAt(0).toUpperCase()
    if (!acc[letter]) acc[letter] = []
    acc[letter].push(species)
    return acc
  }, {})

  return (
    <main className="min-h-screen pt-48 pb-24 px-8 sm:px-12 md:px-24 max-w-7xl mx-auto">
      <div className="mb-16">
        <h1 className="text-4xl md:text-5xl font-light text-white tracking-wide mb-4">Species Index</h1>
        <p className="text-neutral-400 font-mono uppercase tracking-widest text-sm">
          A comprehensive glossary of subjects currently in the repertoire.
        </p>
      </div>

      {uniqueSpecies.length === 0 ? (
        <div className="text-neutral-500 font-light italic">
          No species have been formally tagged in the database yet. 
          (Add a species name to the "Species" field in the Sanity Studio to populate this index).
        </div>
      ) : (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-12 space-y-12">
          {Object.keys(groupedSpecies).sort().map(letter => (
            <div key={letter} className="break-inside-avoid mb-8">
              <h2 className="text-3xl font-serif italic text-white/30 border-b border-white/10 pb-2 mb-4">{letter}</h2>
              <ul className="space-y-3">
                {groupedSpecies[letter].map(species => (
                  <li key={species}>
                    <Link 
                      href={`/species/${encodeURIComponent(species)}`}
                      className="text-neutral-300 hover:text-white hover:underline transition-colors font-light text-lg tracking-wide"
                    >
                      {species}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
