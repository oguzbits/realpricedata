import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { DEFAULT_COUNTRY, isValidCountryCode } from './lib/countries'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip internal paths, static files, and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.includes('.') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/flags')
  ) {
    return NextResponse.next()
  }

  // 1. Check if the URL already has a valid country code
  const segments = pathname.split('/').filter(Boolean)
  const firstSegment = segments[0]
  
  if (firstSegment && isValidCountryCode(firstSegment)) {
    // If it's a valid country code but it's the default country AND it's just the country home (e.g., /us),
    // we might want to redirect to / to keep URLs clean.
    // However, for SEO, it's often better to have ONE canonical URL.
    // Let's allow /[country] for all countries for consistency.
    return NextResponse.next()
  }

  // 2. If no country code, detect the best country
  // First, check for a cookie (saved preference)
  const savedCountry = request.cookies.get('country')?.value
  
  if (savedCountry && isValidCountryCode(savedCountry)) {
    if (savedCountry !== DEFAULT_COUNTRY) {
       // Redirect naked paths (e.g., / or /blog) to localized versions (e.g., /de or /de/blog)
       return NextResponse.redirect(new URL(`/${savedCountry}${pathname}`, request.url))
    }
    // If it's the default country, we stay on the current path
    return NextResponse.next()
  }

  // Next, detect from Accept-Language header (only if no cookie)
  const acceptLanguage = request.headers.get('accept-language')
  if (acceptLanguage && pathname === '/') {
    // Primary language/country extraction
    const preferredLocale = acceptLanguage.split(',')[0].split('-')
    const lang = preferredLocale[0]
    const countryFromHeader = preferredLocale[1]?.toLowerCase() || lang
    
    if (isValidCountryCode(countryFromHeader) && countryFromHeader !== DEFAULT_COUNTRY) {
      return NextResponse.redirect(new URL(`/${countryFromHeader}${pathname}`, request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all paths except static files and internal Next.js paths
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|flags|icon.png).*)',
  ],
}
