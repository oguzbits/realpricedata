import ValidImpressumPage, {
  metadata as impressumMetadata,
} from "@/app/(de)/(root)/impressum/page";
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
  return impressumMetadata;
}

export default async function LocalizedImpressumPage({ params }: Props) {
  const { country } = await params;

  if (country !== "de") {
    redirect("/de/impressum");
  }

  return <ValidImpressumPage />;
}
