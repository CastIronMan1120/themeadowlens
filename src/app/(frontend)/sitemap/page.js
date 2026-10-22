import React from 'react';
import Link from 'next/link';
import { client } from '../../../sanity/lib/client';

export const metadata = {
  title: 'Site Directory & Product Index | The Meadow Lens',
  description: 'Navigate the complete collection of Fine Art Photography, Venues, Sub-Venues, Species Galleries, and Product Pages by David McClure.',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function cleanDisplayTitle(art) {
  if (art?.displayTitle && art.displayTitle.trim()) return art.displayTitle.trim();
  const raw = art?.title || 'Untitled Artwork';
  return raw
    .replace(/\s+\d{1,4}-[A-Za-z0-9_-]+(?:-Edit)?$/i, '')
    .replace(/\s+[A-Z]{1,4}\d{4,}(?:-\d+)?(?:-Edit)?$/i, '')
    .trim() || raw;
}

export default async function SitemapPage() {
  const query = `
  {
    "rootVenues": *[_type == "category" && !(_id in path("drafts.**")) && !defined(parentCategory)] | order(title asc) {
      _id, title, "slug": slug.current,
      "subcategories": *[_type == "category" && !(_id in path("drafts.**")) && parentCategory._ref == ^._id] | order(title asc) {
        _id, title, "slug": slug.current,
        "artworkCount": count(*[_type == "artwork" && !(_id in path("drafts.**")) && references(^._id)])
      },
      "directArtworks": *[_type == "artwork" && !(_id in path("drafts.**")) && category._ref == ^._id && !defined(subcategory)] | order(_createdAt desc) {
        _id, title, displayTitle, "slug": slug.current, species, location
      },
      "directArtworkCount": count(*[_type == "artwork" && !(_id in path("drafts.**")) && category._ref == ^._id && !defined(subcategory)])
    },
    "publishedArtworks": *[_type == "artwork" && !(_id in path("drafts.**")) && (defined(category) || defined(subcategory))] | order(_updatedAt desc) {
      _id,
      title,
      displayTitle,
      "slug": slug.current,
      species,
      location,
      year,
      "categoryTitle": category->title,
      "categorySlug": category->slug.current,
      "parentCategoryTitle": category->parentCategory->title,
      "parentCategorySlug": category->parentCategory->slug.current,
      "subcategoryTitle": subcategory->title,
      "subcategorySlug": subcategory->slug.current
    }
  }`;

  const { rootVenues = [], publishedArtworks = [] } = await client.fetch(query);

  // Compute total sub-venues
  const totalSubVenues = rootVenues.reduce(
    (sum, v) => sum + (v.subcategories ? v.subcategories.length : 0),
    0
  );

  // Compute active photographed species with counts
  const speciesMap = new Map();
  for (const art of publishedArtworks) {
    const sp = (art.species || '').trim();
    if (sp) {
      speciesMap.set(sp, (speciesMap.get(sp) || 0) + 1);
    }
  }
  const activeSpecies = Array.from(speciesMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <main className="min-h-screen bg-black text-white pt-32 sm:pt-40 md:pt-[240px] pb-20 sm:pb-24 px-4 sm:px-6 md:px-16">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 sm:mb-12 border-b border-white/10 pb-6 sm:pb-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 sm:gap-6">
            <div>
              <span className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.2em] sm:tracking-[0.25em] text-emerald-400 block mb-2">
                Fullstack Architecture &amp; Index
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-widest uppercase mb-3 text-white">
                Site Directory
              </h1>
              <p className="text-neutral-400 font-mono text-xs sm:text-sm tracking-wide max-w-2xl leading-relaxed">
                The complete, real-time architectural map of The Meadow Lens — linking every Main Page, Root Venue, Sub-Venue, Species Gallery, and Individual Fine Art Product Page.
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5 sm:gap-3">
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60 hover:text-white text-[11px] sm:text-xs font-mono uppercase tracking-wider transition-colors"
              >
                XML Sitemap (/sitemap.xml) ↗
              </a>
              <Link
                href="/studio"
                className="px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-lg bg-neutral-900 border border-white/15 text-neutral-300 hover:border-white/40 hover:text-white text-[11px] sm:text-xs font-mono uppercase tracking-wider transition-colors"
              >
                Admin Studio (/studio) ⚙
              </Link>
            </div>
          </div>

          {/* Live Database Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mt-6 sm:mt-8 pt-6 border-t border-white/10">
            <div className="bg-neutral-900/60 border border-white/5 rounded-xl p-3.5 sm:p-4">
              <div className="text-xl sm:text-2xl font-bold text-emerald-400">6</div>
              <div className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-neutral-400 mt-1">Core Pages</div>
            </div>
            <div className="bg-neutral-900/60 border border-white/5 rounded-xl p-3.5 sm:p-4">
              <div className="text-xl sm:text-2xl font-bold text-blue-400">{rootVenues.length}</div>
              <div className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-neutral-400 mt-1">Root Venues</div>
            </div>
            <div className="bg-neutral-900/60 border border-white/5 rounded-xl p-3.5 sm:p-4">
              <div className="text-xl sm:text-2xl font-bold text-indigo-400">{totalSubVenues}</div>
              <div className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-neutral-400 mt-1">Sub-Venues</div>
            </div>
            <div className="bg-neutral-900/60 border border-white/5 rounded-xl p-3.5 sm:p-4">
              <div className="text-xl sm:text-2xl font-bold text-amber-400">{publishedArtworks.length}</div>
              <div className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-neutral-400 mt-1">Live Product Pages</div>
            </div>
            <div className="bg-neutral-900/60 border border-white/5 rounded-xl p-3.5 sm:p-4 col-span-2 sm:col-span-1">
              <div className="text-xl sm:text-2xl font-bold text-teal-400">{activeSpecies.length}</div>
              <div className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-neutral-400 mt-1">Species Galleries</div>
            </div>
          </div>
        </header>

        {/* SECTION 1: Main Pages + Root Venues & Sub-Venues */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8 mb-12 sm:mb-16">
          {/* Static Pages */}
          <section className="bg-neutral-900/50 p-5 sm:p-8 rounded-2xl border border-white/10 hover:border-emerald-500/40 transition-colors">
            <h2 className="text-xl font-semibold tracking-widest uppercase mb-6 text-emerald-300 flex items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 mr-3"></span>
              Main Pages
            </h2>
            <ul className="space-y-3.5">
              <li>
                <Link href="/" className="text-base text-neutral-300 hover:text-white transition-colors flex justify-between items-center">
                  <span>Home (The Venues)</span>
                  <span className="text-xs font-mono text-neutral-500">/</span>
                </Link>
              </li>
              <li>
                <Link href="/bird-index" className="text-base text-neutral-300 hover:text-white transition-colors flex justify-between items-center">
                  <span>Species Index (A–Z Glossary)</span>
                  <span className="text-xs font-mono text-neutral-500">/bird-index</span>
                </Link>
              </li>
              <li>
                <Link href="/category/guest-photos" className="text-base text-emerald-300 hover:text-white transition-colors flex justify-between items-center">
                  <span>Guest Photos (Invited Showcase)</span>
                  <span className="text-xs font-mono text-emerald-500/70">/category/guest-photos</span>
                </Link>
              </li>
              <li>
                <Link href="/artist" className="text-base text-neutral-300 hover:text-white transition-colors flex justify-between items-center">
                  <span>The Artist</span>
                  <span className="text-xs font-mono text-neutral-500">/artist</span>
                </Link>
              </li>
              <li>
                <Link href="/news" className="text-base text-neutral-300 hover:text-white transition-colors flex justify-between items-center">
                  <span>What&apos;s New (Dispatches)</span>
                  <span className="text-xs font-mono text-neutral-500">/news</span>
                </Link>
              </li>
              <li>
                <Link href="/?inquire=true" className="text-base text-neutral-300 hover:text-white transition-colors flex justify-between items-center">
                  <span>Inquiries &amp; Comments</span>
                  <span className="text-xs font-mono text-neutral-500">/?inquire=true</span>
                </Link>
              </li>
              <li className="pt-2 border-t border-white/10">
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-neutral-400 hover:text-emerald-300 transition-colors flex justify-between items-center font-mono"
                >
                  <span>Search Engine XML Sitemap</span>
                  <span>/sitemap.xml ↗</span>
                </a>
              </li>
            </ul>
          </section>

          {/* Dynamic Root Venues */}
          {rootVenues.map((venue) => (
            <section
              key={venue._id}
              className="bg-neutral-900/50 p-5 sm:p-8 rounded-2xl border border-white/10 hover:border-blue-500/40 transition-colors flex flex-col justify-between"
            >
              <div>
                <h2 className="text-lg sm:text-xl font-semibold tracking-widest uppercase mb-2 text-blue-300 flex flex-wrap items-center justify-between gap-2">
                  <span className="flex items-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400 mr-2.5 sm:mr-3 shrink-0"></span>
                    <Link href={`/category/${venue.slug}`} className="hover:text-white transition-colors">
                      {venue.title}
                    </Link>
                  </span>
                  <Link
                    href={`/category/${venue.slug}`}
                    className="text-[10px] sm:text-[11px] font-mono text-neutral-500 hover:text-blue-300 font-normal lowercase"
                  >
                    /category/{venue.slug} ↗
                  </Link>
                </h2>

                <ul className="space-y-3 mt-5">
                  {/* Direct Root Artworks list */}
                  {venue.directArtworkCount > 0 && (
                    <li className="bg-black/40 p-3.5 rounded-xl border border-white/5">
                      <div className="flex justify-between items-center text-xs font-mono uppercase tracking-wider text-blue-300 mb-2.5">
                        <span>Direct Venue Artworks</span>
                        <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">
                          {venue.directArtworkCount} {venue.directArtworkCount === 1 ? 'photo' : 'photos'}
                        </span>
                      </div>
                      <ul className="space-y-1.5 pl-2 border-l border-blue-500/30">
                        {venue.directArtworks?.map((art) => (
                          <li key={art._id}>
                            <Link
                              href={`/art/${art.slug}`}
                              className="text-sm text-neutral-300 hover:text-emerald-300 transition-colors flex justify-between items-center gap-2 py-0.5"
                            >
                              <span className="truncate">▸ {cleanDisplayTitle(art)}</span>
                              <span className="text-[10px] font-mono text-neutral-500 shrink-0">Product Page ↗</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </li>
                  )}

                  {/* Subcategories list */}
                  {venue.subcategories?.map((sub) => (
                    <li key={sub._id}>
                      <Link
                        href={`/category/${venue.slug}/${sub.slug}`}
                        className="text-base text-neutral-300 hover:text-white transition-colors flex justify-between items-center group py-1 border-b border-white/5"
                      >
                        <span>{sub.title}</span>
                        <span className="text-xs font-mono text-neutral-400 group-hover:text-blue-300 transition-colors">
                          {sub.artworkCount} {sub.artworkCount === 1 ? 'photo' : 'photos'}
                        </span>
                      </Link>
                    </li>
                  ))}

                  {(!venue.subcategories || venue.subcategories.length === 0) &&
                    venue.directArtworkCount === 0 && (
                      <li className="text-neutral-500 italic text-sm py-2">
                        Curated showcase ready — awaiting published works
                      </li>
                    )}
                </ul>
              </div>
            </section>
          ))}
        </div>

        {/* SECTION 2: Complete Published Fine Art Product Pages (/art/[slug]) */}
        <section className="mb-12 sm:mb-16 bg-neutral-900/40 p-5 sm:p-8 md:p-10 rounded-2xl border border-white/10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 sm:mb-8 pb-5 sm:pb-6 border-b border-white/10">
            <div>
              <span className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.2em] text-amber-400 block mb-1">
                Individual Artwork &amp; Room Visualizer Pages
              </span>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-light tracking-widest uppercase text-white">
                Published Photo / Product Pages ({publishedArtworks.length})
              </h2>
            </div>
            <p className="text-xs font-mono text-neutral-400 max-w-md">
              Every photograph below is live on the website with its own dedicated Collector Product &amp; Wall Visualizer page at <code className="text-amber-300">/art/[slug]</code>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {publishedArtworks
              .filter((a) => a.slug)
              .map((art) => {
                const venueLabel = art.subcategoryTitle
                  ? `${art.categoryTitle || 'Venue'} ▸ ${art.subcategoryTitle}`
                  : art.parentCategoryTitle
                  ? `${art.parentCategoryTitle} ▸ ${art.categoryTitle}`
                  : art.categoryTitle || 'Published';

                return (
                  <Link
                    key={art._id}
                    href={`/art/${art.slug}`}
                    className="group bg-black/60 hover:bg-neutral-900 p-4 rounded-xl border border-white/10 hover:border-amber-400/50 transition-all flex flex-col justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-500/30 truncate">
                          {venueLabel}
                        </span>
                        {art.species && (
                          <span className="text-[10px] font-mono text-emerald-400 truncate">
                            {art.species}
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-medium text-neutral-200 group-hover:text-white line-clamp-1">
                        {cleanDisplayTitle(art)}
                      </h3>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 group-hover:text-amber-300 pt-2 border-t border-white/5">
                      <span className="truncate">/art/{art.slug}</span>
                      <span className="shrink-0 ml-2">View Page ↗</span>
                    </div>
                  </Link>
                );
              })}
          </div>
        </section>

        {/* SECTION 3: Photographed Bird Species Galleries (/species/[speciesName]) */}
        {activeSpecies.length > 0 && (
          <section className="bg-neutral-900/40 p-5 sm:p-8 md:p-10 rounded-2xl border border-white/10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 sm:mb-8 pb-5 sm:pb-6 border-b border-white/10">
              <div>
                <span className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.2em] text-teal-400 block mb-1">
                  Ornithological Species Index
                </span>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-light tracking-widest uppercase text-white">
                  Active Bird Species Pages ({activeSpecies.length})
                </h2>
              </div>
              <Link
                href="/bird-index"
                className="text-xs font-mono uppercase tracking-wider text-teal-300 hover:text-white transition-colors"
              >
                Open Full A–Z Master Glossary (/bird-index) →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {activeSpecies.map((sp) => (
                <Link
                  key={sp.name}
                  href={`/species/${encodeURIComponent(sp.name)}`}
                  className="bg-black/50 hover:bg-neutral-900 px-4 py-3 rounded-lg border border-white/5 hover:border-teal-500/40 transition-colors flex items-center justify-between group"
                >
                  <span className="text-sm text-neutral-300 group-hover:text-white truncate pr-2">
                    {sp.name}
                  </span>
                  <span className="text-xs font-mono text-teal-400/80 bg-teal-950/50 px-2 py-0.5 rounded shrink-0">
                    {sp.count} {sp.count === 1 ? 'photo' : 'photos'}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

