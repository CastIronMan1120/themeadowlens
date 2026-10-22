import { createClient } from 'next-sanity';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2023-05-03',
  useCdn: false,
});

export default async function sitemap() {
  const baseUrl = 'https://themeadowlens.com';

  // Fetch all venues and subcategories with parent info and published artwork counts
  const categories = await client.fetch(`*[_type == "category" && !(_id in path("drafts.**"))]{
    _id,
    "slug": slug.current,
    "parentSlug": parentCategory->slug.current,
    _updatedAt,
    "directCount": count(*[_type == "artwork" && !(_id in path("drafts.**")) && (category._ref == ^._id || subcategory._ref == ^._id)]),
    "childPhotoCount": count(*[_type == "artwork" && !(_id in path("drafts.**")) && category->parentCategory._ref == ^._id])
  }`);

  // Fetch all published artworks that are assigned to a venue or subcategory
  const artworks = await client.fetch(`*[_type == "artwork" && !(_id in path("drafts.**")) && (defined(category) || defined(subcategory))]{
    "slug": slug.current,
    species,
    _updatedAt
  }`);

  const routes = [
    { path: '', priority: 1.0, changeFrequency: 'daily' },
    { path: '/bird-index', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/category/guest-photos', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/artist', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/news', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/sitemap', priority: 0.7, changeFrequency: 'daily' },
  ].map((r) => ({
    url: `${baseUrl}${r.path}`,
    lastModified: new Date().toISOString(),
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const categoryRoutes = [];
  for (const cat of categories) {
    if (!cat.slug || cat.slug === 'guest-photos') continue;
    const totalPhotos = (cat.directCount || 0) + (cat.childPhotoCount || 0);
    // Avoid submitting empty 0-photo placeholder venues to Google to prevent Soft-404 flags
    if (totalPhotos === 0) continue;

    if (cat.parentSlug) {
      categoryRoutes.push({
        url: `${baseUrl}/category/${cat.parentSlug}/${cat.slug}`,
        lastModified: cat._updatedAt || new Date().toISOString(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    } else {
      categoryRoutes.push({
        url: `${baseUrl}/category/${cat.slug}`,
        lastModified: cat._updatedAt || new Date().toISOString(),
        changeFrequency: 'weekly',
        priority: 0.85,
      });
    }
  }

  const artworkRoutes = artworks
    .filter((a) => a.slug)
    .map((art) => ({
      url: `${baseUrl}/art/${art.slug}`,
      lastModified: art._updatedAt || new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

  // Case-insensitively deduplicated active biological species routes
  const canonicalSpeciesMap = {};
  for (const art of artworks) {
    const clean = (art.species || '').trim();
    if (!clean) continue;
    const key = clean.toLowerCase();
    if (!canonicalSpeciesMap[key]) {
      canonicalSpeciesMap[key] = clean;
    }
  }
  const uniqueSpecies = Object.values(canonicalSpeciesMap).sort((a, b) => a.localeCompare(b));

  const speciesRoutes = uniqueSpecies.map((sp) => ({
    url: `${baseUrl}/species/${encodeURIComponent(sp)}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly',
    priority: 0.65,
  }));

  return [...routes, ...categoryRoutes, ...artworkRoutes, ...speciesRoutes];
}
