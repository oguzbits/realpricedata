import { IdealoHomePage } from "@/components/landing/IdealoHomePage";
import { type CountryCode } from "@/lib/countries";
import { getCountryByCode } from "@/lib/server/cached-countries";
import { getAllProducts } from "@/lib/server/cached-products";
import { getLocalizedProductData } from "@/lib/utils/products";
import Script from "next/script";

export async function HomeContent({ country }: { country: CountryCode }) {
  const countryConfig = await getCountryByCode(country);
  const allProducts = await getAllProducts();

  // Transform products for the new idealo-style homepage
  const products = allProducts
    .map((p) => {
      const { price, title } = getLocalizedProductData(
        p,
        countryConfig?.code || country,
      );
      if (price === null || price === 0) return null;

      return {
        title: title || p.title,
        price,
        slug: p.slug,
        image: p.image,
      };
    })
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
      <IdealoHomePage products={products} />
    </>
  );
}

export default HomeContent;
