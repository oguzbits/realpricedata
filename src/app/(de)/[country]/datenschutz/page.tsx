import ValidDatenschutzPage, {
  metadata as privacyMetadata,
} from "@/app/(de)/(root)/datenschutz/page";
import { notFound, redirect } from "next/navigation";

export async function generateStaticParams() {
  return [{ country: "de" }];
}

interface Props {
  params: Promise<{ country: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { country } = await params;
  if (country !== "de") {
    return { title: "Page Not Found" };
  }
  return privacyMetadata;
}

export default async function LocalizedDatenschutzPage({ params }: Props) {
  const { country } = await params;

  if (country !== "de") {
    redirect("/de/datenschutz");
  }

  return <ValidDatenschutzPage />;
}
