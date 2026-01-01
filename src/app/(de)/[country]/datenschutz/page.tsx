import ValidDatenschutzPage, {
  metadata as privacyMetadata,
} from "@/app/(de)/datenschutz/page";
import { isValidCountryCode } from "@/lib/countries";
import { generateCountryParams } from "@/lib/static-params";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return generateCountryParams();
}

export async function generateMetadata(props: any) {
  const params = await props.params;
  const { country } = params;
  if (!isValidCountryCode(country)) {
    return { title: "Page Not Found" };
  }
  return privacyMetadata;
}

export default async function LocalizedDatenschutzPage(props: any) {
  const params = await props.params;
  const { country } = params;

  if (!isValidCountryCode(country)) {
    notFound();
  }

  return <ValidDatenschutzPage />;
}
