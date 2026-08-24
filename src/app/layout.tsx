import { Montserrat } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Providers } from "@/components/Providers";
import "./globals.css";

// Primary typography used by CII
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body className="bg-background text-foreground min-h-screen flex flex-col font-sans antialiased selection:bg-accent selection:text-accent-foreground">
        {/* Global Client Providers (Font size / High contrast state) */}
        <Providers>{children}</Providers>

        {/* Vercel Observability */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
