import { IdealoHomePage } from "@/components/landing/IdealoHomePage";
import { type CountryCode } from "@/lib/countries";
import { getCountryByCode } from "@/lib/server/cached-countries";
import {
  getBestDeals,
  getMostPopular,
  getNewArrivals,
} from "@/lib/server/cached-products";
import { getLocalizedProductData } from "@/lib/utils/products";
import Script from "next/script";

export async function HomeContent({ country }: { country: CountryCode }) {
  const countryConfig = await getCountryByCode(country);
  const countryCode = countryConfig?.code || country;

  // Fetch specialized lists directly from DB for better performance and accuracy
  const [bestDealsData, mostPopularData, newArrivalsData] = await Promise.all([
    getBestDeals(6, countryCode),
    getMostPopular(10, countryCode),
    getNewArrivals(8, countryCode),
  ]);

  // Helper to transform to display format
  const transform = (p: any) => {
    const { price, title } = getLocalizedProductData(p, countryCode);
    if (price === null || price === 0) return null;
    return {
      title: title || p.title,
      price,
      slug: p.slug,
      image: p.image,
    };
  };

  const deals = bestDealsData
    .map((p) => {
      const t = transform(p);
      return t ? { ...t, badgeText: "Top Deal" } : null;
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);

  const bestsellers = mostPopularData
    .map(transform)
    .filter((p): p is NonNullable<typeof p> => p !== null);

  const newArrivals = newArrivalsData
    .map(transform)
    .filter((p): p is NonNullable<typeof p> => p !== null);

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
        deals={deals}
        bestsellers={bestsellers}
        newArrivals={newArrivals}
      />
    </>
  );
}

export default HomeContent;
