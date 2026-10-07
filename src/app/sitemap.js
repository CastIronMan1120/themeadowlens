import { createClient } from 'next-sanity';

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2023-05-03',
  useCdn: false,
});

export default async function sitemap() {
  const baseUrl = 'https://themeadowlens.com';

  // Fetch all venues and categories
  const categories = await client.fetch(`*[_type == "category"]{
    "slug": slug.current,
    _updatedAt
  }`);

  // Fetch all artworks that have a category (meaning they are published to a gallery)
  const artworks = await client.fetch(`*[_type == "artwork" && defined(category)]{
    "slug": slug.current,
    _updatedAt
  }`);

  const routes = [
    '',
    '/artist',
    '/news',
    '/sitemap'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily',
    priority: 1,
  }));

  const categoryRoutes = categories.filter(c => c.slug).map((category) => ({
    url: `${baseUrl}/category/${category.slug}`,
    lastModified: category._updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const artworkRoutes = artworks.filter(a => a.slug).map((art) => ({
    url: `${baseUrl}/art/${art.slug}`,
    lastModified: art._updatedAt,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...routes, ...categoryRoutes, ...artworkRoutes];
}
