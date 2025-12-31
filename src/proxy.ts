import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { DEFAULT_COUNTRY, isValidCountryCode } from "./lib/countries";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip internal paths and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.includes(".") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/flags") ||
    pathname.startsWith("/out")
  ) {
    return NextResponse.next();
  }

  // 2. Identify if the current path is a "US Path" (Root domain content)
  // A path is US if the first segment is NOT a valid country code.
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];
  const isExplicitCountryPath =
    firstSegment && isValidCountryCode(firstSegment);

  // 3. Cookie Enforcement for US Paths
  // If we are on a US path (e.g. / or /electronics) BUT the user prefers a different country,
  // redirect them to that country's localized path.
  if (!isExplicitCountryPath) {
    const countryCookie = request.cookies.get("country")?.value;

    if (
      countryCookie &&
      isValidCountryCode(countryCookie) &&
      countryCookie !== DEFAULT_COUNTRY
    ) {
      // User prefers DE but is visiting /electronics -> Redirect to /de/electronics
      const url = request.nextUrl.clone();
      url.pathname = `/${countryCookie}${pathname}`;
      return NextResponse.redirect(url);
    }
  }

  // Default: Serve as is.
  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
