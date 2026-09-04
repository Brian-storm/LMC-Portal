import { Montserrat } from "next/font/google";
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
    <html lang="zh-hk" className={montserrat.variable}>
      <body className="bg-background text-foreground min-h-screen min-w-[320px] flex flex-col font-sans antialiased selection:bg-accent selection:text-accent-foreground">
        {/* Global Client Providers (Font size / High contrast state) */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
