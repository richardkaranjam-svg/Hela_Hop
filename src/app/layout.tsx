import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { PrivacyAnalytics } from "@/components/PrivacyAnalytics";

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
  title: "Hela Hop",
  description:
    "Shareable M-PESA payment links, invoices, and payment tracking for Kenyan sellers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <PrivacyAnalytics />
      </body>
    </html>
  );
}
