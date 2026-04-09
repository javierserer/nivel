import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NIVEL — Sube de nivel",
  description:
    "Trackea tus hábitos, compite con tu squad, sube de nivel cada semana. La app de hábitos que engancha.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NIVEL",
  },
  openGraph: {
    title: "NIVEL — Sube de nivel",
    description:
      "Trackea tus hábitos, compite con tu squad, sube de nivel cada semana.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NIVEL — Sube de nivel",
    description:
      "Trackea tus hábitos, compite con tu squad, sube de nivel cada semana.",
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/icons/icon-192.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#FC5200",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
