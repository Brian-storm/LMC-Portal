// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "LMC Management Consultancy | Professional CPD Training",
  description:
    "Accredited Continuing Professional Development (CPD) courses in Hong Kong.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="bg-slate-50 text-slate-900 min-h-screen flex flex-col font-sans antialiased">
        {/* Global Client Providers (Font size / High contrast state) */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
