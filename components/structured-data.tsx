import { SITE_DESCRIPTION_EN, SITE_NAME, SITE_URL } from "@/lib/site";

/**
 * Site-wide JSON-LD: who FleetSplit is (Organization) and what it is
 * (WebApplication) — read by search engines and AI answer engines (AEO)
 * alike, independent of the visible copy. Page-specific structured data
 * (FAQPage, BreadcrumbList) lives on the pages that actually have that
 * content, not here.
 */
export function StructuredData() {
  const data = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/logo-mark.png`,
      description: SITE_DESCRIPTION_EN,
    },
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION_EN,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Any (web-based)",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "BDT",
      },
      areaServed: {
        "@type": "Country",
        name: "Bangladesh",
      },
      featureList: [
        "Single-order courier rate comparison across Pathao, RedX, CarryBee, and Steadfast",
        "Bulk CSV/Excel order upload with automatic cheapest-courier splitting",
        "Bangla and English interface",
      ],
    },
  ];

  return (
    <script
      type="application/ld+json"
      // JSON.stringify of a fixed, code-defined object — no user input flows
      // into this, so this is not an XSS vector.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
