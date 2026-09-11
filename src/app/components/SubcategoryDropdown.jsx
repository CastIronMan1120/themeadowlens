'use client'

import { useRouter } from 'next/navigation'

export default function SubcategoryDropdown({ subcategories, categorySlug, currentSubcategorySlug }) {
  const router = useRouter()

  const handleChange = (e) => {
    const val = e.target.value
    if (val === 'all') {
      router.push(`/category/${categorySlug}`)
    } else {
      router.push(`/category/${categorySlug}/${val}`)
    }
  }

  if (!subcategories || subcategories.length === 0) return null

  return (
    <div className="sticky top-[88px] z-40 bg-neutral-950/90 backdrop-blur-xl border-y border-white/10 w-full mb-8">
      <div className="max-w-[2000px] mx-auto px-4 sm:px-8 md:px-16 py-4 flex items-center justify-between">
        <label htmlFor="subcategory-select" className="text-neutral-500 text-xs uppercase tracking-[0.2em] font-mono mr-4 hidden sm:block">
          Explore Collection
        </label>
        
        <select 
          id="subcategory-select"
          value={currentSubcategorySlug || 'all'}
          onChange={handleChange}
          className="w-full sm:max-w-md appearance-none bg-neutral-900 border border-neutral-700 text-white text-sm md:text-base py-3 px-6 rounded-sm uppercase tracking-widest font-mono focus:outline-none focus:border-white transition-colors cursor-pointer"
          style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}
        >
          <option value="all">All {categorySlug.replace(/-/g, ' ')}</option>
          {subcategories.map(sub => (
            <option key={sub._id || sub.id} value={sub.slug?.current || sub.slug}>
              {sub.title}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
