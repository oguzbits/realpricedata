"use client"

import { useParams } from "next/navigation";
import HomeContent from "@/components/HomeContent";

export default function CountryHomePage() {
  const params = useParams();
  const country = typeof params.country === 'string' ? params.country : 'us';
  return <HomeContent country={country.toLowerCase()} />;
}
