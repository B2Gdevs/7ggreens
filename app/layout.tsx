import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import { SiteHeader } from "@/components/chrome/SiteHeader";
import { SiteFooter } from "@/components/chrome/SiteFooter";
import { SiteVisualContextProvider } from "@/components/providers/SiteVisualContextProvider";
import { SiteDevIdProvider } from "@/components/providers/SiteDevIdProvider";
import { structuredData } from "./structured-data";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["SOFT", "WONK", "opsz"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://7greens.farm"),
  title: {
    default: "7G Greens — Field-fresh produce from Tyler, Texas",
    template: "%s · 7G Greens",
  },
  description:
    "Chemical-free, non-GMO vegetable boxes from Uncle Paul's Agritourism & Educational Corp. Cold-chain delivery to East Texas and Dallas-Fort Worth. No subscription — order what you want, when you want.",
  keywords: [
    "leafy greens",
    "kale",
    "collards",
    "fresh vegetables",
    "Tyler Texas",
    "Dallas Fort Worth",
    "farm direct",
    "non-GMO",
    "chemical-free",
    "UPAEC",
    "vegetable boxes",
    "cold-chain delivery",
    "regenerative farming",
  ],
  openGraph: {
    title: "7G Greens — Field-fresh produce, cold-chain delivered",
    description:
      "Non-GMO vegetable boxes from a chemical-free farm in Tyler, TX. No subscription.",
    url: "https://7greens.farm",
    siteName: "7G Greens",
    type: "website",
    images: [
      {
        url: "https://7greens.farm/opengraph-image",
        width: 1200,
        height: 630,
        alt: "7G Greens — Field-fresh produce from Tyler, Texas",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "7G Greens — Field-fresh produce, cold-chain delivered",
    description:
      "Non-GMO vegetable boxes from a chemical-free farm in Tyler, TX. No subscription.",
    images: ["https://7greens.farm/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${jakarta.variable}`}>
      <head>
        {structuredData.map((data, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
          />
        ))}
      </head>
      <body className="min-h-screen flex flex-col">
        <SiteVisualContextProvider>
          <SiteDevIdProvider>
            <SiteHeader />
            <main className="flex-1" data-cid="site.main">
              {children}
            </main>
            <SiteFooter />
          </SiteDevIdProvider>
        </SiteVisualContextProvider>
      </body>
    </html>
  );
}
