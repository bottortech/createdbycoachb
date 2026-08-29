import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import GlobalErrorOverlay from "@/components/GlobalErrorOverlay";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Created by Coach B | Portfolio",
  description:
    "Builder. Designer. Founder. Author. Creating products, systems, and experiences that solve real problems and push ideas forward.",
  metadataBase: new URL("https://www.createdbycoachb.com"),
  openGraph: {
    title: "Created by Coach B | Portfolio",
    description:
      "Builder. Designer. Founder. Author. Creating products, systems, and experiences that solve real problems and push ideas forward.",
    url: "https://www.createdbycoachb.com",
    siteName: "Created by Coach B",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/images/og-default.png",
        width: 1200,
        height: 630,
        alt: "Created by Coach B — Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Created by Coach B | Portfolio",
    description:
      "Builder. Designer. Founder. Author. Creating products, systems, and experiences that solve real problems and push ideas forward.",
    images: ["/images/og-default.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body>
        <GlobalErrorOverlay />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
