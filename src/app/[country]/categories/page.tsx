"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"
import { getCategoryHierarchy, getCategoryPath } from "@/lib/categories"
import { isValidCountryCode, DEFAULT_COUNTRY } from "@/lib/countries"

export default function CategoriesPageWithCountry() {
  const params = useParams()
  const countryCode = params.country as string
  const validCountry = isValidCountryCode(countryCode) ? countryCode : DEFAULT_COUNTRY
  const categoryHierarchy = getCategoryHierarchy()

  return (
    <div className="container pt-6 pb-16 mx-auto px-4">
      {/* Breadcrumb */}
      <nav className="mb-8" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-sm text-muted-foreground">
          <li>
            <Link href={`/${validCountry}`} className="hover:text-foreground transition-colors">
              Home
            </Link>
          </li>
          <li>/</li>
          <li className="text-foreground font-medium">Categories</li>
        </ol>
      </nav>
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">All Categories</h1>
        <p className="text-xl text-muted-foreground">
          Browse our comprehensive list of tracked product categories.
        </p>
      </div>
      <div className="space-y-16">
        {categoryHierarchy.map((hierarchy) => (
          <section key={hierarchy.parent.slug} aria-labelledby={`${hierarchy.parent.slug}-heading`}>
            <div className="flex items-center gap-3 mb-6 border-b pb-4">
              <hierarchy.parent.icon className="h-8 w-8 text-primary" aria-hidden="true" />
              <h2 id={`${hierarchy.parent.slug}-heading`} className="text-2xl font-bold">{hierarchy.parent.name}</h2>
              <Badge variant="outline" className="ml-auto">
                {hierarchy.children.length} {hierarchy.children.length === 1 ? 'category' : 'categories'}
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {hierarchy.children.map((category) => (
                <Link 
                  key={category.slug} 
                  className="no-underline group" 
                  href={getCategoryPath(category.slug, validCountry)} 
                >
                  <div className="flex items-center p-3 rounded-lg border border-border/50 bg-card/40 hover:bg-muted/40 hover:border-primary/30 transition-all">
                    <div className="flex-shrink-0 w-10 h-10 rounded-md bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                      <category.icon className="h-5 w-5" />
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                         <h3 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors truncate">
                            {category.name}
                         </h3>
                         {category.unitType && (
                           <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground uppercase tracking-wider">
                             /{category.unitType}
                           </span>
                         )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {category.description}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all ml-2" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
