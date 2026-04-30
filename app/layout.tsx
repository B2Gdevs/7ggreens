import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { SiteHeader } from "@/components/chrome/SiteHeader";
import { SiteFooter } from "@/components/chrome/SiteFooter";
import { SiteVisualContextProvider } from "@/components/providers/SiteVisualContextProvider";
import { SiteDevIdProvider } from "@/components/providers/SiteDevIdProvider";
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
  title: {
    default: "7Greens — Field-fresh produce from Tyler, Texas",
    template: "%s · 7Greens",
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
  ],
  openGraph: {
    title: "7Greens — Field-fresh produce, cold-chain delivered",
    description:
      "Non-GMO vegetable boxes from a chemical-free farm in Tyler, TX. No subscription.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${jakarta.variable}`}>
      <head />
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
