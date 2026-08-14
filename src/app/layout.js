import "./globals.css";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";

export const metadata = {
  title: "The Meadow Lens | Fine Art Photography",
  description: "Experience the story behind the lens. High-end fine art photography of the Meadowlands and beyond by David.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-black text-white">
        <Navigation />
        {children}
        <Footer />
      </body>
    </html>
  );
}
