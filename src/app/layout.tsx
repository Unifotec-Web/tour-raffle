import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tour Raffle — Premium Tropical Travel & Raffle Platform",
  description: "Discover Tour Raffle, register your unique entry code, and take part in a transparent prize draw.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
