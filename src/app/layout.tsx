import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer"

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
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 min-h-screen flex flex-col font-sans">
        {/* Persistent Shared Navbar */}
        <Navbar />

        {/* Dynamic Page Content */}
        <main className="flex-1">{children}</main>

        {/* Persistent Shared Footer */}
        <Footer />
      </body>
    </html>
  );
}
