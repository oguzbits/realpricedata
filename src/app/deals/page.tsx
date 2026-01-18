import { IdealoCategoryPage } from "@/components/category/IdealoCategoryPage";
import { CATEGORY_MAP } from "@/lib/categories";
import { DEFAULT_COUNTRY } from "@/lib/countries";

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const metadata = {
  title: "Deals & Angebote | cleverprices",
  description:
    "Finde die besten Deals und Angebote für Elektronik, Computer und mehr. Täglich geprüft und aktualisiert.",
};

export default async function DealsPage({ searchParams }: Props) {
  const filters = await searchParams;
  const category = CATEGORY_MAP["deals"]; // Now exists in categories.ts

  return (
    <IdealoCategoryPage
      category={{
        ...category,
        slug: "deals",
      }}
      countryCode={DEFAULT_COUNTRY}
      searchParams={filters}
    />
  );
}
