import type { Metadata } from "next";
import {
  Geist_Mono,
  Bricolage_Grotesque,
  Geist,
  Inter,
  Kode_Mono,
} from "next/font/google";
// import { GlobalProviders } from "@/components/providers/global";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bodyFont = Geist({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const displayFont = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const interFont = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const monoFont = Kode_Mono({
  variable: "--font-kode",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const SITE_URL = "https://www.calrix.in";
const OG_DESCRIPTION =
  "Calrix is a AI platform that reads your inbox, manages your calendar, and handles the follow-ups, so you can focus on the work that actually matters.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: "Calrix | Your Email and Calendar, on Autopilot",
    template: "%s | Calrix",
  },
  description: OG_DESCRIPTION,
  keywords: [
    "AI email",
    "AI calendar",
    "email automation",
    "inbox management",
    "AI assistant",
    "calendar scheduling",
    "productivity app",
    "email AI",
  ],
  authors: [{ name: "Bikash Shaw", url: "https://www.bikashshaw.in" }],
  creator: "Bikash Shaw",
  publisher: "Bikash Shaw",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Calrix",
    title: "Calrix | Your Email and Calendar, on Autopilot",
    description: OG_DESCRIPTION,
    images: [
      {
        url: "/og-image.webp",
        width: 1200,
        height: 630,
        alt: "Calrix — Your Email and Calendar, on Autopilot",
        type: "image/webp",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Calrix | Your Email and Calendar, on Autopilot",
    description: OG_DESCRIPTION,
    images: ["/og-image.webp"],
  },

  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${bodyFont.variable} ${displayFont.variable} ${monoFont.variable} ${interFont.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
