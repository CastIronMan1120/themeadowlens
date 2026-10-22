import { client } from '../../../sanity/lib/client'
import Link from 'next/link'

export const revalidate = 0

export const metadata = {
  title: 'Species Index | The Meadow Lens',
  description: 'An alphabetical encyclopedia of bird species photographed by David McClure.'
}

export default async function BirdIndexPage() {
  // Fetch all defined species from published/categorized artworks
  const rawSpecies = await client.fetch(`*[_type == "artwork" && defined(species) && defined(category)].species`)
  
  // Count occurrences per species (case-insensitive canonical deduplication)
  const canonicalMap = {}
  const speciesCounts = rawSpecies.reduce((acc, s) => {
    if (!s) return acc
    const clean = s.trim()
    if (!clean) return acc
    const key = clean.toLowerCase()
    if (!canonicalMap[key]) {
      canonicalMap[key] = clean
    }
    const label = canonicalMap[key]
    acc[label] = (acc[label] || 0) + 1
    return acc
  }, {})

  // Deduplicate and sort alphabetically
  const uniqueSpecies = Object.keys(speciesCounts).sort((a, b) => a.localeCompare(b))

  // Group by first letter for the glossary layout
  const groupedSpecies = uniqueSpecies.reduce((acc, species) => {
    const letter = species.charAt(0).toUpperCase()
    if (!acc[letter]) acc[letter] = []
    acc[letter].push(species)
    return acc
  }, {})

  const letters = Object.keys(groupedSpecies).sort()
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

  return (
    <main className="min-h-screen pt-6 sm:pt-8 md:pt-10 pb-20 sm:pb-24 px-4 sm:px-8 md:px-24 max-w-7xl mx-auto">
      <div className="mb-10 sm:mb-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-white tracking-wide mb-3 sm:mb-4">Species Index</h1>
        <p className="text-neutral-400 font-mono uppercase tracking-wider sm:tracking-widest text-xs sm:text-sm leading-relaxed">
          A comprehensive A–Z glossary of {uniqueSpecies.length} biological subjects currently in the repertoire.
        </p>

        {letters.length > 0 && (
          <div className="mt-6 sm:mt-8 flex flex-wrap gap-1.5 sm:gap-2 border-y border-white/10 py-3 sm:py-4">
            {alphabet.map((letter) => {
              const hasEntries = Boolean(groupedSpecies[letter]?.length)
              return hasEntries ? (
                <a
                  key={letter}
                  href={`#letter-${letter}`}
                  className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center text-xs font-mono uppercase tracking-widest text-neutral-200 hover:text-white hover:bg-white/10 border border-white/20 transition-colors rounded-sm"
                >
                  {letter}
                </a>
              ) : (
                <span
                  key={letter}
                  className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center text-xs font-mono uppercase tracking-widest text-neutral-700 border border-white/5 select-none rounded-sm"
                >
                  {letter}
                </span>
              )
            })}
          </div>
        )}
      </div>

      {uniqueSpecies.length === 0 ? (
        <div className="text-neutral-500 font-light italic">
          No species have been formally tagged in the database yet. 
          (Add a species name to the &ldquo;Species&rdquo; field in the Sanity Studio to populate this index).
        </div>
      ) : (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 sm:gap-12 space-y-8 sm:space-y-12">
          {letters.map(letter => (
            <div key={letter} id={`letter-${letter}`} className="break-inside-avoid mb-6 sm:mb-8 scroll-mt-32 sm:scroll-mt-44">
              <h2 className="text-2xl sm:text-3xl font-serif italic text-white/30 border-b border-white/10 pb-2 mb-3 sm:mb-4">{letter}</h2>
              <ul className="space-y-2.5 sm:space-y-3">
                {groupedSpecies[letter].map(species => (
                  <li key={species} className="flex items-baseline justify-between gap-3">
                    <Link 
                      href={`/species/${encodeURIComponent(species)}`}
                      className="text-neutral-200 hover:text-white hover:underline transition-colors font-light text-base sm:text-lg tracking-wide py-0.5"
                    >
                      {species}
                    </Link>
                    <span className="text-[11px] font-mono text-neutral-500 shrink-0">
                      ({speciesCounts[species]})
                    </span>
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
