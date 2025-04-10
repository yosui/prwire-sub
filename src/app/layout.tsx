import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from 'react-hot-toast';
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PRWi.re",
  description: "Verify Your Power for The People",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://verify.prwi.re'),
  openGraph: {
    title: "PRWi.re",
    description: "Verify Your Power for The People",
    url: "https://verify.prwi.re",
    siteName: "PRWIRE Subscriber",
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "PRWIRE Subscriber",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PRWi.re",
    description: "Verify Your Power for The People",
    images: ["/og-default.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="ja">
        <body className={inter.className}>
        <NavBar />
          {children}
          <Toaster position="top-right" />
        <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
