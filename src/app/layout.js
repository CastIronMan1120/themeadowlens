import "./globals.css";

export const metadata = {
  title: "The Meadow Lens | Fine Art Photography by David McClure",
  description: "Experience the story behind the lens. High-end fine art photography of the Meadowlands, birds, vistas, and beyond by David McClure.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">{children}</body>
    </html>
  );
}
