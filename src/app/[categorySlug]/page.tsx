import { CategoryProductsView } from "@/components/category/CategoryProductsView.server";
import { ParentCategoryView } from "@/components/category/ParentCategoryView";
import {
  getCategoryBySlug,
  getChildCategories,
  stripCategoryIcon,
  allCategories,
  type CategorySlug,
} from "@/lib/categories";
import { DEFAULT_COUNTRY } from "@/lib/countries";
import {
  generateKeywords,
  getAlternateLanguages,
  getOpenGraph,
} from "@/lib/metadata";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{
    categorySlug: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateStaticParams() {
  return Object.values(allCategories)
    .filter((c) => !c.hidden)
    .map((c) => ({ categorySlug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorySlug } = await params;
  const validCountry = DEFAULT_COUNTRY;
  const category = getCategoryBySlug(categorySlug);
  if (!category) return { title: "Category Not Found" };

  const canonicalUrl = `https://cleverprices.com/${category.slug}`;
  const title = `${category.name} - Compare Prices ${validCountry.toUpperCase()}`;
  const description = `Compare ${category.name} prices. Find the best deals on top brands.`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: getAlternateLanguages(`/${categorySlug}`),
    },
    openGraph: getOpenGraph({
      title,
      description,
      url: canonicalUrl,
      locale: "de_DE",
    }),
    keywords: generateKeywords(category),
  };
}

export default async function DedicatedCategoryPage({
  params,
  searchParams,
}: Props) {
  const { categorySlug } = await params;
  const category = getCategoryBySlug(categorySlug);

  if (!category) notFound();

  // If it's a parent category (no parent slug), show the parent view
  if (!category.parent) {
    const childCategories = getChildCategories(categorySlug as CategorySlug);
    return (
      <ParentCategoryView
        parentCategory={stripCategoryIcon(category)}
        childCategories={childCategories.map(stripCategoryIcon)}
        countryCode={DEFAULT_COUNTRY}
      />
    );
  }

  // If it's a child category, show the products view
  const filters = await searchParams;
  return (
    <CategoryProductsView
      category={stripCategoryIcon(category)}
      countryCode={DEFAULT_COUNTRY}
      searchParams={filters}
    />
  );
}
