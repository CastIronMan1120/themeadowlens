import "./globals.css";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import { client } from "../sanity/lib/client";
import { Suspense } from "react";
import GlobalInquiryModal from "./components/GlobalInquiryModal";
import localFont from 'next/font/local';

const modernLove = localFont({
  src: './fonts/modern-love-grunge.ttf',
  variable: '--font-logo',
  display: 'swap',
});

export const metadata = {
  title: "The Meadow Lens | Fine Art Photography by David McClure",
  description: "Experience the story behind the lens. High-end fine art photography of the Meadowlands, birds, vistas, and beyond by David McClure.",
  keywords: ["Fine Art Photography", "The Meadowlands", "Nature Photography", "Bird Photography", "David McClure", "New Jersey Photography"],
  authors: [{ name: "David McClure" }],
  openGraph: {
    title: "The Meadow Lens | Fine Art Photography",
    description: "Experience the story behind the lens. High-end fine art photography of the Meadowlands, birds, vistas, and beyond by David McClure.",
    url: "https://themeadowlens.vercel.app",
    siteName: "The Meadow Lens",
    type: "website",
  },
};

export const revalidate = 0;

export default async function RootLayout({ children }) {
  const categoriesQuery = `*[_type == "category" && !defined(parentCategory)] | order(title asc) {
    ...,
    "menuImageUrl": menuImage.asset->url
  }`
  const categories = await client.fetch(categoriesQuery)

  return (
    <html
      lang="en"
      className={`h-full antialiased ${modernLove.variable}`}
    >
      <body className="min-h-full flex flex-col bg-black text-white">
        <Navigation categories={categories} />
        <main className="flex-grow flex flex-col">
          {children}
        </main>
        <Footer />
        <Suspense fallback={null}>
          <GlobalInquiryModal />
        </Suspense>
      </body>
    </html>
  );
}
