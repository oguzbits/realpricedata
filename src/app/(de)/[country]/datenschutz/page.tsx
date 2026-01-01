import ValidDatenschutzPage, {
  metadata as privacyMetadata,
} from "@/app/(de)/datenschutz/page";
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
  return privacyMetadata;
}

export default async function LocalizedDatenschutzPage({ params }: Props) {
  const { country } = await params;

  if (!isValidCountryCode(country)) {
    notFound();
  }

  return <ValidDatenschutzPage />;
}
