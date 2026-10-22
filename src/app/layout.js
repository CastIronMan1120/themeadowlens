import { Analytics } from '@vercel/analytics/react';
import "./globals.css";

export const metadata = {
  metadataBase: new URL('https://themeadowlens.com'),
  title: "The Meadow Lens | NJ Meadowlands Bird, Wildlife & Nature Photography by David McClure",
  description: "Explore The Meadow Lens by Northern NJ native David McClure — fine art photography of birds, wildlife, flora, fauna, and NYC skyline vistas captured across the New Jersey Meadowlands and Atlantic Flyway.",
  keywords: [
    "The Meadow Lens",
    "David McClure Photography",
    "NJ Meadowlands Bird Photography",
    "New Jersey Wildlife Photography",
    "Atlantic Flyway Birds",
    "DeKorte Park Photography",
    "Fine Art Nature Prints",
    "Meadowlands Vistas and Scenery",
    "Bird Species Index",
    "Northern NJ Nature Photographer"
  ],
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "The Meadow Lens | NJ Meadowlands Bird & Nature Photography by David McClure",
    description: "Fine art photography of birds, wildlife, flora, fauna, and scenic vistas captured across the New Jersey Meadowlands by David McClure.",
    url: 'https://themeadowlens.com',
    siteName: 'The Meadow Lens',
    images: [
      {
        url: 'https://cdn.sanity.io/images/h7ncr8cq/production/e9e353906b85748121aaa9747813c81f602079e6-515x432.png',
        width: 515,
        height: 432,
        alt: 'The Meadow Lens — Fine Art Photography by David McClure',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
