import type { Metadata } from "next";
import { Inter, Spectral } from "next/font/google";
import "./globals.css";
import { Header } from "@/components";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const spectral = Spectral({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-spectral",
});

export const metadata: Metadata = {
  title: "Hapseer",
  description: "HapSeer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spectral.variable}`}>
      <body className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-serif antialiased">
        <main className="max-w-3xl mx-auto px-4 py-8">
          <Header />
          {children}
        </main>
      </body>
    </html>
  );
}
