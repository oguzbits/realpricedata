import ValidFAQPage, {
  metadata as faqMetadata,
} from "@/app/(en)/(root)/faq/page";
import { isValidCountryCode } from "@/lib/countries";
import { generateCountryParams } from "@/lib/static-params";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return generateCountryParams();
}

interface Props {
  params: Promise<{ country: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { country } = await params;
  if (!isValidCountryCode(country)) {
    return { title: "Page Not Found" };
  }
  return faqMetadata;
}

export default async function LocalizedFAQPage({ params }: Props) {
  const { country } = await params;

  if (!isValidCountryCode(country)) {
    notFound();
  }

  return <ValidFAQPage />;
}
