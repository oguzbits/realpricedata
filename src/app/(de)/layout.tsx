import RootLayoutWrapper from "@/app/RootLayoutWrapper";
import { siteMetadata } from "@/lib/metadata";
import { Metadata, Viewport } from "next";

export const metadata: Metadata = siteMetadata;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function DeRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RootLayoutWrapper lang="de">{children}</RootLayoutWrapper>;
}
