"use client"

import Link from "next/link"
import { useParams, redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { getCategoryBySlug, getChildCategories, getCategoryPath } from "@/lib/categories"
import { Button } from "@/components/ui/button"
import { isValidCountryCode, DEFAULT_COUNTRY } from "@/lib/countries"

export default function ParentCategoryPageWithCountry() {
  const params = useParams()
  const countryCode = params.country as string
  const parentSlug = params.parent as string
  
  // If country code is invalid (e.g. it's actually a parent category like "electronics"),
  // redirect to the default country URL
  if (!isValidCountryCode(countryCode)) {
    redirect(`/${DEFAULT_COUNTRY}/${countryCode}/${parentSlug}`)
  }
  
  const validCountry = countryCode
  
  const parentCategory = getCategoryBySlug(parentSlug)
  const childCategories = getChildCategories(parentSlug)

  if (!parentCategory) {
    return (
      <div className="container py-12 mx-auto px-4">
        <div className="text-center py-24">
          <h1 className="text-4xl font-bold mb-4">Category Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The category you're looking for doesn't exist.
          </p>
          <Button asChild>
            <Link href={`/${validCountry}`}>Browse All Categories</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6 mx-auto px-4">
      {/* Breadcrumb */}
      <nav className="mb-8" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-sm text-muted-foreground">
          <li>
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href={`/${validCountry}/categories`} className="hover:text-foreground transition-colors">
              Categories
            </Link>
          </li>
          <li>/</li>
          <li className="text-foreground font-medium">{parentCategory.name}</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 bg-primary/10 rounded-2xl">
            <parentCategory.icon className="h-10 w-10 text-primary" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">{parentCategory.name}</h1>
            <p className="text-xl text-muted-foreground mt-2">
              {parentCategory.description}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-sm">
          {childCategories.length} {childCategories.length === 1 ? 'Category' : 'Categories'}
        </Badge>
      </div>

      {/* Child Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {childCategories.map((category) => (
          <Link 
            key={category.slug} 
            className="no-underline group" 
            href={getCategoryPath(category.slug, validCountry)} 
            aria-label={`Browse ${category.name}: ${category.description}`}
          >
            <div className="flex items-center p-3 rounded-lg border border-border/50 bg-card/40 hover:bg-muted/40 hover:border-primary/30 transition-all">
              <div className="shrink-0 w-10 h-10 rounded-md bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                <category.icon className="h-5 w-5" aria-hidden="true" />
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

      {/* Back to Categories */}
      <div className="mt-12 text-center">
        <Button variant="outline" asChild>
          <Link href={`/${validCountry}/categories`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to All Categories
          </Link>
        </Button>
      </div>
    </div>
  )
}
