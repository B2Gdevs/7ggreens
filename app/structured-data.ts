import { SITE, BOX_FALLBACKS } from "@/lib/site/constants";

export const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.legalName,
    url: "https://7greens.farm",
    logo: "https://7greens.farm/opengraph-image",
    sameAs: [],
  },
  {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: SITE.brand,
    description: SITE.tagline,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address.street,
      addressLocality: SITE.address.city,
      addressRegion: SITE.address.state,
      postalCode: SITE.address.zip,
      addressCountry: "US",
    },
    telephone: SITE.phones[0],
    areaServed: SITE.serviceArea,
    url: "https://7greens.farm",
  },
  {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Vegetable Boxes",
    description:
      "Chemical-free, non-GMO vegetable boxes delivered via cold-chain to East Texas and Dallas-Fort Worth.",
    brand: {
      "@type": "Brand",
      name: SITE.brand,
    },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      lowPrice: BOX_FALLBACKS.starter.priceCents / 100,
      highPrice: BOX_FALLBACKS.family.priceCents / 100,
      offerCount: 2,
      availability: "https://schema.org/InStock",
    },
  },
];
