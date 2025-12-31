import { BaseLayout } from "@/components/layout/BaseLayout";
import { PageLayout } from "@/components/layout/PageLayout";
import { siteMetadata } from "@/lib/metadata";
import { Metadata } from "next";

export const metadata: Metadata = {
  ...siteMetadata,
  openGraph: {
    ...siteMetadata.openGraph,
    locale: "de_DE",
  },
};

export default function GermanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BaseLayout lang="de">
      <PageLayout country="de">{children}</PageLayout>
    </BaseLayout>
  );
}
