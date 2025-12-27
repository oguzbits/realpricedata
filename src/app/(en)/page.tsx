import HomeContent from "@/components/HomeContent";
import { DEFAULT_COUNTRY } from "@/lib/countries";
import { getAlternateLanguages } from "@/lib/metadata";
import { Metadata } from "next";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://realpricedata.com",
    languages: getAlternateLanguages(),
  },
  openGraph: {
    url: "https://realpricedata.com",
  },
};

export default function HomePage() {
  return <HomeContent country={DEFAULT_COUNTRY} />;
}
