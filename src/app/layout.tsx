import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import type { Viewport } from "next";

export const viewport: Viewport = {
  maximumScale: 1,
};

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "えるのじろたりー",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
