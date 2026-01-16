import { IdealoHomePage } from "@/components/landing/IdealoHomePage";
import { type CountryCode } from "@/lib/countries";
import { getCountryByCode } from "@/lib/server/cached-countries";
import {
  getBestDeals,
  getMostPopular,
  getNewArrivals,
} from "@/lib/server/cached-products";
import Script from "next/script";
import { curateProductList } from "@/lib/product-curation";

export async function HomeContent({ country }: { country: CountryCode }) {
  const countryConfig = await getCountryByCode(country);
  const countryCode = countryConfig?.code || country;

  // Fetch ample data to allow for strict filtering
  const [rawDeals, rawPopular, rawNew] = await Promise.all([
    getBestDeals(200, countryCode, "New"),
    getMostPopular(2000, countryCode, "New"),
    getNewArrivals(250, countryCode, "New"),
  ]);

  // Global duplicate tracker across ALL sections
  const globalSeen = new Set<string>();
  const globalSeenParents = new Set<string>();

  // Helper to update seen set
  const markSeen = (items: any[]) => {
    items.forEach((p) => {
      globalSeen.add(p.slug);
      if (p.parentAsin) globalSeenParents.add(p.parentAsin);
    });
  };

  // 1. Hero Section: "Revenue Kings"
  // High Price (>200€) + High Volume = The true market flagships (iPhones, GPUs, Consoles)
  // Logic: A product selling 5k units at 800€ (Rev: 4M) > 10k units at 20€ (Rev: 200k)
  const heroProducts = curateProductList(rawPopular, countryCode, {
    maxItems: 5,
    minPrice: 200,
    sortBy: "revenue",
    categoryLimit: 1,
    excludeIds: globalSeen,
    excludeParentIds: globalSeenParents,
  });
  markSeen(heroProducts);

  // 2. Bestsellers: "Volume Kings"
  // Quality mix of everything else that sells well
  const bestsellers = curateProductList(rawPopular, countryCode, {
    maxItems: 10,
    sortBy: "quality",
    categoryLimit: 1,
    excludeIds: globalSeen,
    excludeParentIds: globalSeenParents,
  });
  markSeen(bestsellers);

  // 3. Top Deals
  const deals = curateProductList(rawDeals, countryCode, {
    maxItems: 10,
    requireDiscount: true,
    sortBy: "quality",
    categoryLimit: 2, // Allow a bit more variety in deals
    excludeIds: globalSeen,
    excludeParentIds: globalSeenParents,
  }).map((p) => ({ ...p, badgeText: "Top Deal" }));
  markSeen(deals);

  // 4. New Arrivals
  const newArrivals = curateProductList(rawNew, countryCode, {
    maxItems: 12,
    sortBy: "quality",
    categoryLimit: 2, // Reduced from 4 to prevent "All Mainboards" issue
    excludeIds: globalSeen,
    excludeParentIds: globalSeenParents,
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "cleverprices.com",
    url: "https://cleverprices.com",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://cleverprices.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <Script
        id="json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <IdealoHomePage
        popular={heroProducts} // Hero = High Revenue Flagships
        deals={deals}
        bestsellers={bestsellers}
        newArrivals={newArrivals}
      />
    </>
  );
}

export default HomeContent;
