import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hertz — Intelligent Global Radio",
  description:
    "An intelligent global audio system. Stream 110+ verified radio stations across India, US, Europe, Asia-Pacific, Australia, South America and Africa. Built with precision.",
  authors: [{ name: "Hertz" }],
  manifest: "/manifest.json",
  icons: {
    icon: "/app-icon.png",
    apple: "/app-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Hertz",
  },
  openGraph: {
    title: "Hertz — Intelligent Global Radio",
    description:
      "Stream 110+ verified radio stations worldwide. Precision-engineered. Built on the MATRIX design system.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hertz — Intelligent Global Radio",
    description: "Stream 110+ verified radio stations worldwide. Precision-engineered.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0A0A0A",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
