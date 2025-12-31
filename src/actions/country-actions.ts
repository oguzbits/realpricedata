"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function setCountryAction(
  countryCode: string,
  targetPath: string,
) {
  // 1. Set the cookie
  const cookieStore = await cookies();
  cookieStore.set("country", countryCode.toLowerCase(), {
    path: "/",
    maxAge: 31536000,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  // 2. Revalidate the target path (or layout) to ensure client cache is purged
  // Revalidating the root layout is the safest bet to ensure all country-dependent data is fresh.
  revalidatePath("/", "layout");

  // 3. Redirect to the new path
  redirect(targetPath);
}
