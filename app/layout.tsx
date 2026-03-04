import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import { NextAuthProvider } from "@/components/providers/session-provider";
import "./globals.css";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "NAFSMA - National Association of Flood & Stormwater Management Agencies",
    template: "%s | NAFSMA",
  },
  description:
    "NAFSMA advocates federal flood and stormwater policy that benefits communities. Representing 200+ public agencies nationwide for 46+ years.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://nafsma.org"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={sourceSans.variable}>
      <body className="min-h-screen bg-background font-body antialiased">
        <NextAuthProvider>{children}</NextAuthProvider>
      </body>
    </html>
  );
}
