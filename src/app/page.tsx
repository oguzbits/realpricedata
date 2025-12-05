import HomeContent from "@/components/HomeContent";
import { DEFAULT_COUNTRY } from "@/lib/countries";

export default function HomePage() {
  return <HomeContent country={DEFAULT_COUNTRY} />;
}
