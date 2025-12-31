import { BaseLayout } from "@/components/layout/BaseLayout";
import { siteMetadata } from "@/lib/metadata";
import { Metadata } from "next";
import * as React from "react";

export const metadata: Metadata = siteMetadata;

export default function LocalizedRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BaseLayout lang="en">{children}</BaseLayout>;
}
