import { PageLayout } from "@/components/layout/PageLayout";

export default function GermanRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageLayout country="de">{children}</PageLayout>;
}
