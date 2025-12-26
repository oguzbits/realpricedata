import { MetadataRoute } from "next";
import {
  getCategoryHierarchy,
  getCategoryPath,
  allCategories,
} from "@/lib/categories";
import { getAllCountries } from "@/lib/countries";
import { getAllBlogPosts } from "@/lib/blog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://realpricedata.com";

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/impressum",
    "/datenschutz",
    "/faq",
    "/blog",
    "/en/legal-notice",
    "/en/privacy",
  ].map((route) => {
    const entry: any = {
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: route === "" ? 1.0 : 0.8,
    };

    // Add alternates for the homepage
    if (route === "") {
      const liveCountries = getAllCountries().filter((c) => c.isLive);
      entry.alternates = {
        languages: {
          ...Object.fromEntries(
            liveCountries.map((c) => [
              c.code === "us" ? "en-US" : `en-${c.code.toUpperCase()}`,
              `${baseUrl}/${c.code}`,
            ])
          ),
          "x-default": `${baseUrl}/us`,
        },
      };
    }

    return entry;
  });

  // Blog posts
  const blogPosts = await getAllBlogPosts();
  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.lastUpdated || post.publishDate),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Get category hierarchy
  const categoryHierarchy = getCategoryHierarchy();

  // Generate URLs for all live countries
  const liveCountries = getAllCountries().filter((c) => c.isLive);
  const countries = liveCountries.map((c) => c.code);

  const countryRoutes: MetadataRoute.Sitemap = [];

  countries.forEach((country) => {
    // Country home page
    countryRoutes.push({
      url: `${baseUrl}/${country}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
      alternates: {
        languages: Object.fromEntries(
          liveCountries.map((c) => [
            c.code === "us" ? "en-US" : `en-${c.code.toUpperCase()}`,
            `${baseUrl}/${c.code}`,
          ]),
        ),
      },
    });

    // Country categories page
    countryRoutes.push({
      url: `${baseUrl}/${country}/categories`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
      alternates: {
        languages: Object.fromEntries(
          liveCountries.map((c) => [
            c.code === "us" ? "en-US" : `en-${c.code.toUpperCase()}`,
            `${baseUrl}/${c.code}/categories`,
          ]),
        ),
      },
    });

    // Parent category pages
    categoryHierarchy.forEach((hierarchy) => {
      const path = `/${hierarchy.parent.slug}`;
      countryRoutes.push({
        url: `${baseUrl}/${country}${path}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
        alternates: {
          languages: Object.fromEntries(
            liveCountries.map((c) => [
              c.code === "us" ? "en-US" : `en-${c.code.toUpperCase()}`,
              `${baseUrl}/${c.code}${path}`,
            ]),
          ),
        },
      });
    });

    // Child category pages (product listing pages)
    Object.values(allCategories)
      .filter((cat) => cat.parent) // Only categories with parents
      .forEach((category) => {
        const fullPath = getCategoryPath(category.slug, country);
        countryRoutes.push({
          url: `${baseUrl}${fullPath}`,
          lastModified: new Date(),
          changeFrequency: "daily" as const,
          priority: 0.9, // Higher priority for product pages
          alternates: {
            languages: Object.fromEntries(
              liveCountries.map((c) => [
                c.code === "us" ? "en-US" : `en-${c.code.toUpperCase()}`,
                `${baseUrl}${getCategoryPath(category.slug, c.code)}`,
              ]),
            ),
          },
        });
      });
  });

  return [...staticRoutes, ...blogRoutes, ...countryRoutes];
}
