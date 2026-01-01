import ValidLegalNoticePage, {
  metadata as legalMetadata,
} from "@/app/(en)/(root)/legal-notice/page";
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
  return legalMetadata;
}

export default async function LocalizedLegalNoticePage({ params }: Props) {
  const { country } = await params;

  if (!isValidCountryCode(country)) {
    notFound();
  }

  return <ValidLegalNoticePage />;
}
