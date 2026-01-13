"use client";

import { IdealoProductCarousel } from "@/components/IdealoProductCarousel";
import { EmptyState } from "@/components/ui/EmptyState";
import { IdealoHero } from "./IdealoHero";
import { IdealoSection } from "./IdealoSection";

interface Product {
  title: string;
  price: number;
  slug: string;
  image?: string;
  badgeText?: string;
}

interface IdealoHomePageProps {
  popular: Product[];
  deals: Product[];
  bestsellers: Product[];
  newArrivals: Product[];
}

export function IdealoHomePage({
  popular,
  deals,
  bestsellers,
  newArrivals,
}: IdealoHomePageProps) {
  // Handle empty state if all lists are empty
  if (
    popular.length === 0 &&
    deals.length === 0 &&
    bestsellers.length === 0 &&
    newArrivals.length === 0
  ) {
    return (
      <div className="bg-[#f5f5f5]">
        <IdealoSection variant="white" className="py-12">
          <EmptyState
            title="Willkommen bei cleverprices!"
            description="Wir bauen gerade unseren Produktkatalog auf. Schauen Sie sich in der Zwischenzeit unsere Kategorien an."
            action={{
              label: "Kategorien entdecken",
              href: "/categories",
            }}
          />
        </IdealoSection>
      </div>
    );
  }

  return (
    <div className="bg-[#f5f5f5]">
      {/* Hero Section - light blue bg */}
      {popular.length > 0 && (
        <IdealoSection variant="lightBlue" className="py-4">
          <IdealoHero products={popular} />
        </IdealoSection>
      )}

      {/* Bestseller Carousel - white bg */}
      {bestsellers.length > 0 && (
        <IdealoSection variant="white">
          <IdealoProductCarousel title="Bestseller" products={bestsellers} />
        </IdealoSection>
      )}

      {/* Top Deals - light blue bg (alternating) */}
      {deals.length > 0 && (
        <IdealoSection variant="lightBlue">
          <IdealoProductCarousel
            title="Aktuelle Deals für dich"
            products={deals}
          />
        </IdealoSection>
      )}

      {/* New Arrivals - white bg (alternating) */}
      {newArrivals.length > 0 && (
        <IdealoSection variant="white">
          <IdealoProductCarousel title="Neuheiten" products={newArrivals} />
        </IdealoSection>
      )}
    </div>
  );
}
