"use client";

import { useCountry } from "@/hooks/use-country";
import { Footer } from "./Footer";

export function FooterWrapper() {
  const { country } = useCountry();
  return <Footer country={country} />;
}
