import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/navbar";
import BottomNav from "@/components/layout/bottom-nav";
import Footer from "@/components/layout/footer";
import AnalyticsTracker from "@/components/analytics/tracker";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "FootCare Bhuj | Premium Multi-Brand Footwear Showrooms",
    template: "%s | FootCare Bhuj",
  },
  description: "Explore the latest footwear, apparel, and active gear collections from Nike, Skechers, Puma, Asics, and Jockey across FootCare Bhuj showrooms.",
  metadataBase: new URL("https://www.footcarebhuj.com"),
  keywords: ["Footwear Bhuj", "Nike Bhuj", "Skechers Bhuj", "FootCare Store", "Sports Shoes Bhuj", "Buy Shoes Bhuj"],
  openGraph: {
    title: "FootCare Bhuj | Premium Multi-Brand Footwear Showrooms",
    description: "Explore the latest footwear, apparel, and active gear collections from Nike, Skechers, Puma, Asics, and Jockey across FootCare Bhuj showrooms.",
    url: "https://www.footcarebhuj.com",
    siteName: "FootCare Bhuj",
    locale: "en_IN",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AnalyticsTracker />
        <Navbar />
        {children}
        <BottomNav />
        <Footer />
      </body>
    </html>
  );
}
