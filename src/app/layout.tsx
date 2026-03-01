import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";


const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});



export const metadata: Metadata = {
  title: "KnockKnock",
  description: "Yelp for Neighborhoods",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      
      <body className={`${inter.variable} font-sans antialiased min-h-screen bg-background text-foreground`}>
        <Navbar />
        <main>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
