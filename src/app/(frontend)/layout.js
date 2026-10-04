import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { client } from "../../sanity/lib/client";
import { Suspense } from "react";
import GlobalInquiryModal from "../components/GlobalInquiryModal";
import localFont from 'next/font/local';

const modernLove = localFont({
  src: '../fonts/modern-love-grunge.ttf',
  variable: '--font-logo',
  display: 'swap',
});

export const revalidate = 0;

export default async function FrontendLayout({ children }) {
  const categoriesQuery = `*[_type == "category" && !defined(parentCategory)] | order(title asc) {
    ...,
    "menuImageUrl": menuImage.asset->url
  }`
  const categories = await client.fetch(categoriesQuery)

  return (
    <div className={`min-h-screen flex flex-col antialiased ${modernLove.variable}`}>
      <Navigation categories={categories} />
      <main className="flex-grow flex flex-col">
        {children}
      </main>
      <Footer />
      <Suspense fallback={null}>
        <GlobalInquiryModal />
      </Suspense>
    </div>
  );
}
