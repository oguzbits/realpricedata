import { PopularProducts } from "@/components/PopularProducts";
import { getCountryByCode, type CountryCode } from "@/lib/countries";
import { getAllProducts } from "@/lib/server/cached-products";
import { adaptToUIModel, getLocalizedProductData } from "@/lib/utils/products";

export async function PopularProductsWrapper({ country }: { country: CountryCode }) {
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

  return <PopularProducts products={uiProducts} country={country} />;
}
