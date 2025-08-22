import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components";

export const metadata: Metadata = {
  title: "Hapseer Blog",
  description: "A space for steps forward",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-800 font-mono">
        <main className="max-w-3xl mx-auto px-4 py-8">
          <Header />
          {children}
        </main>
      </body>
    </html>
  );
}
