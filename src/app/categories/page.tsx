import { Breadcrumbs } from "@/components/breadcrumbs";
import { IdealoCategoryOverview } from "@/components/categories/IdealoCategoryOverview";
import { getCategoriesForDisplay } from "@/lib/data/categoryData";
import { getAlternateLanguages, getOpenGraph } from "@/lib/metadata";
import { getSiteUrl } from "@/lib/site-config";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const canonicalUrl = getSiteUrl("/categories");

  const title = `Alle Kategorien - Preisvergleich`;
  const description = `Durchsuchen Sie alle Produktkategorien. Vergleichen Sie Preise und finden Sie die besten Angebote.`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: getAlternateLanguages("/categories"),
    },
    openGraph: getOpenGraph({
      title,
      description,
      url: canonicalUrl,
      locale: `de_DE`,
    }),
  };
}

export default function CategoriesPage() {
  // Get categories from the actual supported categories
  const categories = getCategoriesForDisplay();

  // Breadcrumb items for Idealo-style navigation
  const breadcrumbItems = [
    {
      name: "Startseite",
      href: "/",
    },
    {
      name: "Alle Kategorien",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content Container */}
      <div className="mx-auto max-w-[1280px] px-4">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={breadcrumbItems}
          className="py-3 text-[13px] text-[#666]"
        />

        {/* Page Title Section */}
        <div className="mb-6">
          <h1 className="text-[24px] font-bold text-[#2d2d2d]">
            Alle Kategorien
          </h1>
          <p className="mt-1 text-[14px] text-[#666]">
            Durchsuchen Sie unsere {categories.length} Produktkategorien und
            finden Sie die besten Preise.
          </p>
        </div>

        {/* Category Grid */}
        <IdealoCategoryOverview
          categories={categories}
          className="mb-8 border-t border-l border-[#e5e5e5]"
        />
      </div>
    </div>
  );
}
