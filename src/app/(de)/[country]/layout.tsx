import { PageLayout } from "@/components/layout/PageLayout";
import {
  DEFAULT_COUNTRY,
  isValidCountryCode,
  type CountryCode,
} from "@/lib/countries";

interface Props {
  children: React.ReactNode;
  params: Promise<{ country: string }>;
}

export default async function LocalizedGermanLegalLayout({
  children,
  params,
}: Props) {
  const { country } = await params;
  const isInternalCountry = isValidCountryCode(country);
  const normalizedCountry = isInternalCountry
    ? (country.toLowerCase() as CountryCode)
    : DEFAULT_COUNTRY;

  return <PageLayout country={normalizedCountry}>{children}</PageLayout>;
}
