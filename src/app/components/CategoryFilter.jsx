import Link from 'next/link'

export default function CategoryFilter({ categories, currentCategory }) {
  if (!categories || categories.length === 0) return null

  // Ensure "Birds" is always first, then alphabetize the rest
  const sortedCategories = [...categories].sort((a, b) => {
    if (a.title.toLowerCase() === 'birds') return -1
    if (b.title.toLowerCase() === 'birds') return 1
    return a.title.localeCompare(b.title)
  })

  return (
    <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-8 md:px-16 mb-12">
      <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
        
        {/* 'All' Button */}
        <Link 
          href="/#exhibition"
          className={`px-6 py-2 rounded-full border text-sm uppercase tracking-widest font-mono transition-colors ${
            !currentCategory 
              ? 'bg-white text-black border-white' 
              : 'bg-transparent text-neutral-400 border-neutral-700 hover:border-white hover:text-white'
          }`}
        >
          All
        </Link>

        {/* Dynamic Category Buttons */}
        {sortedCategories.map((cat) => (
          <Link
            key={cat._id}
            href={`/?category=${cat.slug?.current}#exhibition`}
            className={`px-6 py-2 rounded-full border text-sm uppercase tracking-widest font-mono transition-colors ${
              currentCategory === cat.slug?.current
                ? 'bg-white text-black border-white'
                : 'bg-transparent text-neutral-400 border-neutral-700 hover:border-white hover:text-white'
            }`}
          >
            {cat.title}
          </Link>
        ))}
        
      </div>
    </div>
  )
}
