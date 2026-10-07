import React from 'react';
import Link from 'next/link';
import { client } from '../../../sanity/lib/client';

export const metadata = {
  title: 'Site Directory | The Meadow Lens',
  description: 'Navigate the complete collection of Fine Art Photography by David McClure.',
};

export const revalidate = 0;

export default async function SitemapPage() {
  const query = `
  {
    "rootVenues": *[_type == "category" && !defined(parentCategory)] | order(title asc) {
      _id, title, "slug": slug.current,
      "subcategories": *[_type == "category" && references(^._id)] | order(title asc) {
        _id, title, "slug": slug.current,
        "artworkCount": count(*[_type == "artwork" && references(^._id)])
      },
      "directArtworkCount": count(*[_type == "artwork" && references(^._id)])
    }
  }`;

  const { rootVenues } = await client.fetch(query);

  return (
    <main className="min-h-screen bg-black text-white pt-32 pb-24 px-6 md:px-16">
      <div className="max-w-7xl mx-auto">
        <header className="mb-16 border-b border-white/10 pb-8">
          <h1 className="text-4xl md:text-5xl font-light tracking-widest uppercase mb-4 text-emerald-400">
            Site Directory
          </h1>
          <p className="text-neutral-400 font-mono tracking-wide">
            The complete architectural map of The Meadow Lens collection.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {/* Static Pages */}
          <section className="bg-neutral-900/50 p-8 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-colors">
            <h2 className="text-2xl font-semibold tracking-widest uppercase mb-6 text-emerald-300 flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-400 mr-3"></span>
              Main Pages
            </h2>
            <ul className="space-y-4">
              <li>
                <Link href="/" className="text-lg text-neutral-300 hover:text-white transition-colors block">
                  Home (The Venues)
                </Link>
              </li>
              <li>
                <Link href="/artist" className="text-lg text-neutral-300 hover:text-white transition-colors block">
                  The Artist
                </Link>
              </li>
              <li>
                <Link href="/news" className="text-lg text-neutral-300 hover:text-white transition-colors block">
                  What's New (Timeline)
                </Link>
              </li>
              <li>
                <Link href="/?inquire=true" className="text-lg text-neutral-300 hover:text-white transition-colors block text-left">
                  Inquiries & Comments
                </Link>
              </li>
            </ul>
          </section>

          {/* Dynamic Galleries */}
          {rootVenues.map((venue) => (
            <section key={venue._id} className="bg-neutral-900/50 p-8 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-colors">
              <h2 className="text-2xl font-semibold tracking-widest uppercase mb-6 text-blue-300 flex items-center">
                <span className="w-2 h-2 rounded-full bg-blue-400 mr-3"></span>
                <Link href={`/category/${venue.slug}`} className="hover:text-blue-100 transition-colors">
                  {venue.title}
                </Link>
              </h2>
              
              <ul className="space-y-4">
                {venue.directArtworkCount > 0 && (
                  <li>
                    <Link href={`/category/${venue.slug}`} className="text-neutral-400 hover:text-white transition-colors flex justify-between items-center text-sm font-mono bg-black/20 p-2 rounded">
                      <span>Root Gallery Artworks</span>
                      <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">{venue.directArtworkCount}</span>
                    </Link>
                  </li>
                )}
                
                {venue.subcategories?.map((sub) => (
                  <li key={sub._id}>
                    <Link href={`/category/${sub.slug}`} className="text-lg text-neutral-300 hover:text-white transition-colors flex justify-between items-center group">
                      <span>{sub.title}</span>
                      <span className="text-xs font-mono text-neutral-500 group-hover:text-blue-300 transition-colors">
                        {sub.artworkCount} photos
                      </span>
                    </Link>
                  </li>
                ))}
                
                {(!venue.subcategories || venue.subcategories.length === 0) && venue.directArtworkCount === 0 && (
                  <li className="text-neutral-600 italic text-sm">Under Construction</li>
                )}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
