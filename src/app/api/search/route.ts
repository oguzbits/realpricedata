import { getAllBlogPosts } from "@/lib/blog";
import { allCategories, getCategoryPath } from "@/lib/categories";
import { CountryCode } from "@/lib/countries";
import { getProductsByCategory } from "@/lib/product-registry";
import { getLocalizedProductData } from "@/lib/utils/products";
import { NextResponse } from "next/server";

const CURRENCY_MAP: Record<string, string> = {
  us: "USD",
  de: "EUR",
  uk: "GBP",
  ca: "CAD",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const country = (searchParams.get("country") || "us") as CountryCode;
  const currency = CURRENCY_MAP[country] || "USD";

  const results: any[] = [];

  // 1. Categories
  Object.values(allCategories).forEach((cat) => {
    if (cat.hidden) return;
    results.push({
      id: `cat-${cat.slug}`,
      title: cat.name,
      description: cat.description,
      group: "Categories",
      url: getCategoryPath(cat.slug, country),
      icon: "LayoutGrid",
    });
  });

  // 2. Blog Posts
  const posts = await getAllBlogPosts();
  posts.forEach((post) => {
    results.push({
      id: `post-${post.slug}`,
      title: post.title,
      description: post.description,
      group: "Articles",
      url:
        country === "us"
          ? `/blog/${post.slug}`
          : `/${country}/blog/${post.slug}`,
      icon: "FileText",
    });
  });

  // 3. Products
  const visibleCategories = Object.values(allCategories).filter(
    (c) => !c.hidden,
  );

  for (const cat of visibleCategories) {
    const products = getProductsByCategory(cat.slug);

    products.forEach((product) => {
      const localized = getLocalizedProductData(product, country);
      if (!localized.title) return; // Skip if no title for this country

      // URL construction depends on category
      const productUrl = `${getCategoryPath(cat.slug, country)}?search=${encodeURIComponent(localized.title)}`;

      results.push({
        id: `prod-${product.id}`,
        title: localized.title,
        description: `Compare ${cat.name} prices`,
        group: "Products",
        url: productUrl,
        icon: "Package",
        meta: {
          price: localized.price,
          currency: currency,
        },
      });
    });
  }

  // 4. Navigation / Static
  results.push(
    {
      id: "nav-home",
      title: "Home",
      group: "Navigation",
      url: country === "us" ? "/" : `/${country}`,
      icon: "Home",
    },
    {
      id: "nav-blog",
      title: "Blog",
      group: "Navigation",
      url: country === "us" ? "/blog" : `/${country}/blog`,
      icon: "BookOpen",
    },
  );

  return NextResponse.json(results);
}
