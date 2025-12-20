import { HeroCategoryPills } from "@/components/hero-category-pills";
import { HeroDealCards } from "@/components/hero-deal-cards";
import { HeroTableDemo } from "@/components/hero-table-demo";
import { PopularProducts } from "@/components/PopularProducts";
import { PriceDrops } from "@/components/PriceDrops";
import { getAllProducts, getAffiliateRedirectPath } from "@/lib/product-registry";
import { getCountryByCode, getAllCountries } from "@/lib/countries";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";

export async function HomeContent({ country }: { country: string }) {
  const countryConfig = getCountryByCode(country);
  const allProducts = getAllProducts();
  
  // Adapt products to UI model
  const uiProducts = allProducts.map(p => ({
    asin: p.asin,
    title: p.title,
    price: { 
      amount: p.price, 
      currency: countryConfig?.currency || "EUR", 
      displayAmount: `${p.price} ${countryConfig?.currency || "€"}` 
    },
    image: "", // Placeholder used in ProductCard anyway
    url: getAffiliateRedirectPath(p.slug),
    category: p.category,
    capacity: `${p.capacity}${p.capacityUnit}`,
    pricePerUnit: p.category === 'ram' ? (p.pricePerGB ? `${p.pricePerGB} ${countryConfig?.currency || "€"}/GB` : undefined) : (p.pricePerTB ? `${p.pricePerTB} ${countryConfig?.currency || "€"}/TB` : undefined)
  }));

  // Create mock data for sections using real products
  const mockPopularProducts = uiProducts.slice(0, 5).map(p => ({
    ...p,
    rating: 4.5 + Math.random() * 0.5,
    reviewCount: Math.floor(Math.random() * 1000) + 50
  }));

  const mockPriceDrops = uiProducts.slice(2, 6).map(p => {
    const dropPercentage = Math.floor(Math.random() * 20) + 10;
    const oldPrice = p.price.amount / (1 - dropPercentage / 100);
    return {
      ...p,
      dropPercentage,
      oldPrice
    };
  });
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "realpricedata.com",
    url: "https://realpricedata.com",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://realpricedata.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };
  return (
    <div className="flex flex-col gap-0 pb-8 md:pb-16 bg-background">
      <Script
        id="json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Top Banner */}
      <div className="w-full bg-destructive py-2 px-4 flex items-center justify-center gap-3 text-destructive-foreground text-center shadow-sm">
        <Image src="/icon-192.png" alt="Promo" width={24} height={24} className="invert hidden sm:block opacity-90" />
        <p className="text-sm font-bold tracking-tight">Compare real-time deals and save big this holiday! 🎁</p>
        <Link href={`/${country}/categories`} className="text-xs underline font-bold ml-2 whitespace-nowrap hover:opacity-80 transition-opacity">Shop Now →</Link>
      </div>

      <div className="flex flex-col gap-2 sm:gap-4 md:gap-8 pt-4">
        {/* Hero Section */}
        <section className="container px-4 mx-auto pt-4 sm:pt-8 md:pt-12 pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-16">
            <div className="max-w-2xl text-left order-1 lg:order-1">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter mb-6 leading-[1.05] text-[#1a1a1a] dark:text-foreground">
                Save money on your <br />
                <span className="text-(--hero-emphasis)">next Amazon purchase.</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-xl">
                <strong className="font-black tracking-tight">
                  <span className="text-(--ccc-red)">Real</span>
                  <span className="text-(--ccc-orange)">Price</span>
                  <span className="text-(--ccc-yellow)">Data</span>
                  <span className="text-muted-foreground/60">.com</span>
                </strong> is an Amazon price tracker and unit-price calculator to ensure you never overpay again.
              </p>

              <div className="flex flex-col gap-6">
                 <div className="flex items-center gap-2 text-sm text-muted-foreground">
                   <HeroCategoryPills />
                 </div>
              </div>
            </div>
            <div className="relative w-full max-w-[800px] mx-auto lg:ml-auto order-2 lg:order-2">
              <HeroTableDemo />
            </div>
          </div>

          {/* Feature Cards Section */}

          {/* Country Flag Selection Wrapper */}
          <div className="flex flex-col items-center justify-center py-10 border-y border-border mb-16">
            <p className="text-xs text-muted-foreground mb-6 uppercase tracking-widest font-bold">Supported Marketplaces</p>
            <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
              {getAllCountries().map((c: any) => (
                <Link 
                  key={c.code} 
                  href={c.isLive ? `/${c.code}` : "#"}
                  className={`group flex flex-col items-center gap-2 transition-transform no-underline ${
                    c.isLive 
                      ? "hover:scale-110 cursor-pointer" 
                      : "opacity-30 grayscale cursor-not-allowed pointer-events-none"
                  }`}
                  aria-disabled={!c.isLive}
                >
                  <span className="text-4xl filter drop-shadow-sm">{c.flag}</span>
                  <span className="text-[10px] font-bold text-muted-foreground group-hover:text-[#0066CC] dark:group-hover:text-blue-400 transition-colors">{c.code.toUpperCase()}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Highlighted Deals Section */}
          <HeroDealCards />

          <div className="container px-4 mx-auto pb-6 sm:pb-12">
            <PopularProducts products={uiProducts} />
            <PriceDrops products={mockPriceDrops} />
          </div>

        </section>
      </div>
    </div>
  );
}

export default HomeContent;
