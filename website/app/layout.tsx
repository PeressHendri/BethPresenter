import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BethPresenter | Worship Software Alternatif Profesional",
  description: "Kelola lagu, tampilkan Alkitab, sinkron ke layar ekstra — tanpa internet, tanpa akun. 100% Offline Worship Presentation Software terbaik.",
  keywords: ["worship software", "presentasi gereja", "easyworship alternative", "gpresenter", "bethpresenter", "offline worship"],
  openGraph: {
    title: "BethPresenter - Presentasi Ibadah Sederhana & Powerful",
    description: "Tanpa akun. Tanpa langganan bulanan. 100% Offline.",
    images: [{ url: "/og-image.jpg" }]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
