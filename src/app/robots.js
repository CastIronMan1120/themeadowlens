export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/studio', '/studio/', '/api/'],
      },
    ],
    sitemap: 'https://themeadowlens.com/sitemap.xml',
    host: 'https://themeadowlens.com',
  };
}
