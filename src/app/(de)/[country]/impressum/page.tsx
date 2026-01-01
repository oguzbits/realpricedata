import ValidImpressumPage, {
  metadata as impressumMetadata,
} from "@/app/(de)/impressum/page";
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
  return impressumMetadata;
}

export default async function LocalizedImpressumPage({ params }: Props) {
  const { country } = await params;

  if (!isValidCountryCode(country)) {
    notFound();
  }

  // Optional: Redirect non-DE users to English legal notice?
  // For now, let's allow it to render if explicitly visited,
  // but we will control navigation via Footer.

  return <ValidImpressumPage />;
}
