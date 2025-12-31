import { BaseLayout } from "@/components/layout/BaseLayout";
import { PageLayout } from "@/components/layout/PageLayout";
import { siteMetadata } from "@/lib/metadata";
import { Metadata } from "next";

export const metadata: Metadata = {
  ...siteMetadata,
  openGraph: {
    ...siteMetadata.openGraph,
    locale: "en_US",
  },
};

export default function EnglishLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BaseLayout lang="en">
      <PageLayout country="us">{children}</PageLayout>
    </BaseLayout>
  );
}
