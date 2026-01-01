import ValidImpressumPage, {
  metadata as impressumMetadata,
} from "@/app/(de)/impressum/page";
import { isValidCountryCode } from "@/lib/countries";
import { generateCountryParams } from "@/lib/static-params";
import { notFound, redirect } from "next/navigation";

export async function generateStaticParams() {
  return generateCountryParams();
}

export async function generateMetadata(props: any) {
  const params = await props.params;
  const { country } = params;
  if (!isValidCountryCode(country)) {
    return { title: "Page Not Found" };
  }
  return impressumMetadata;
}

export default async function LocalizedImpressumPage(props: any) {
  const params = await props.params;
  const { country } = params;

  if (!isValidCountryCode(country)) {
    notFound();
  }

  // Optional: Redirect non-DE users to English legal notice?
  // For now, let's allow it to render if explicitly visited,
  // but we will control navigation via Footer.

  return <ValidImpressumPage />;
}
