import "./globals.css";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import { client } from "../sanity/lib/client";

export const metadata = {
  title: "The Meadow Lens | Fine Art Photography",
  description: "Experience the story behind the lens. High-end fine art photography of the Meadowlands and beyond by David.",
};

export const revalidate = 0;

export default async function RootLayout({ children }) {
  const categoriesQuery = `*[_type == "category" && !defined(parentCategory)] | order(title asc)`
  const categories = await client.fetch(categoriesQuery)

  return (
    <html
      lang="en"
      className={`h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-black text-white">
        <Navigation categories={categories} />
        {children}
        <Footer />
      </body>
    </html>
  );
}
