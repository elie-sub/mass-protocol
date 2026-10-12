import type { Metadata, Viewport } from "next";
import { Archivo, Big_Shoulders } from "next/font/google";
import "./globals.css";

// "Big Shoulders" at opsz 72 is the former "Big Shoulders Display" (see .d in globals.css).
const display = Big_Shoulders({ variable: "--nf-display", subsets: ["latin"], axes: ["opsz"], display: "swap", adjustFontFallback: false });
const body = Archivo({ variable: "--nf-body", subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap" });

export const metadata: Metadata = {
  title: "Mass Protocol",
  description: "365 days. One mission.",
  applicationName: "Mass Protocol",
  appleWebApp: { capable: true, title: "Mass Protocol", statusBarStyle: "black-translucent" },
  icons: {
    icon: [{ url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" }, { url: "/icons/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${display.variable} ${body.variable}`}>
      <body className="mp">{children}</body>
    </html>
  );
}
