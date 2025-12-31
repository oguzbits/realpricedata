import HomeContent from "@/components/HomeContent";
import { ParentCategoryView } from "@/components/category/ParentCategoryView";
import {
  getCategoryBySlug,
  getCategoryHierarchy,
  getChildCategories,
} from "@/lib/categories";
import { AllCategoriesView } from "@/components/category/AllCategoriesView";
import {
  DEFAULT_COUNTRY,
  isValidCountryCode,
  type CountryCode,
} from "@/lib/countries";
import {
  getAlternateLanguages,
  getHomePageMetadata,
  getOpenGraph,
} from "@/lib/metadata";
import { generateCountryParams } from "@/lib/static-params";
import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

type Props = {
  params: Promise<{ country: string }>;
};

export async function generateStaticParams() {
  return generateCountryParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country } = await params;

  // If it's a valid country code (like 'uk', 'ca', etc.)
  if (isValidCountryCode(country)) {
    return getHomePageMetadata(country.toLowerCase());
  }

  // Handle parent categories and 'categories' path
  const category = getCategoryBySlug(country);
  const isCategories = country === "categories";
  if (isCategories || (category && !category.parent)) {
    const validCountry = DEFAULT_COUNTRY;
    const title = isCategories
      ? `All Categories - Amazon ${validCountry.toUpperCase()}`
      : `${category?.name} - Amazon ${validCountry.toUpperCase()}`;
    const description = isCategories
      ? `Browse all tracked product categories on Amazon ${validCountry.toUpperCase()}. Compare hardware prices by true cost per TB/GB to find the best value deals.`
      : `Track ${category?.name} prices on Amazon ${validCountry.toUpperCase()} by true cost per TB/GB. Compare hardware value and find the best storage deals instantly.`;
    const canonicalUrl = `https://realpricedata.com/${isCategories ? "categories" : category?.slug}`;

    return {
      title,
      description,
      alternates: {
        canonical: canonicalUrl,
        languages: getAlternateLanguages(
          `/${isCategories ? "categories" : category?.slug}`,
        ),
      },
      openGraph: getOpenGraph({
        title,
        description,
        url: canonicalUrl,
        locale: `en_${validCountry.toUpperCase()}`,
      }),
    };
  }

  // Fallback
  return getHomePageMetadata(DEFAULT_COUNTRY);
}

export default async function CountryHomePage({ params }: Props) {
  const { country } = await params;

  // Handle valid country codes
  if (isValidCountryCode(country)) {
    return <HomeContent country={country.toLowerCase() as CountryCode} />;
  }

  // 3. Check if it's a parent category slug (e.g. /electronics)
  const category = getCategoryBySlug(country);
  if (category && !category.parent) {
    const childCategories = getChildCategories(category.slug);
    return (
      <ParentCategoryView
        parentCategory={JSON.parse(JSON.stringify(category))}
        childCategories={JSON.parse(JSON.stringify(childCategories))}
        countryCode={DEFAULT_COUNTRY}
      />
    );
  }

  // 4. Handle 'categories' root path for US
  if (country === "categories") {
    const hierarchyRaw = getCategoryHierarchy();
    const categoryHierarchy = JSON.parse(JSON.stringify(hierarchyRaw));

    return (
      <AllCategoriesView
        categoryHierarchy={categoryHierarchy}
        countryCode={DEFAULT_COUNTRY}
      />
    );
  }

  // 5. Otherwise 404
  notFound();
}
