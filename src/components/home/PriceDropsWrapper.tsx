import { PriceDrops } from "@/components/PriceDrops";
import { getCountryByCode, type CountryCode } from "@/lib/countries";
import { getAllProducts } from "@/lib/server/cached-products";
import { adaptToUIModel, getLocalizedProductData } from "@/lib/utils/products";

export async function PriceDropsWrapper({ country }: { country: CountryCode }) {
  const countryConfig = getCountryByCode(country);
  const allProducts = await getAllProducts();

  const uiProducts = allProducts
    .map((p) => {
      const { price } = getLocalizedProductData(p, countryConfig?.code || country);
      if (price === null || price === 0) return null;

      return adaptToUIModel(
        p,
        countryConfig?.code || country,
        countryConfig?.currency,
        countryConfig?.symbol,
      );
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);

  const mockPriceDrops = uiProducts.slice(2, 6).map((p) => {
    const hash = p.asin.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const dropPercentage = (hash % 10) + 5;
    const oldPrice = p.price.amount / (1 - dropPercentage / 100);
    return {
      ...p,
      dropPercentage,
      oldPrice,
    };
  });

  return <PriceDrops products={mockPriceDrops} country={country} />;
}
