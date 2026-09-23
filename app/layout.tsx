import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { SpeedInsights } from "@vercel/speed-insights/next";

import "./globals.css";
import { ThemeProvider } from "./provider";

const inter = Inter({ subsets: ["latin"] });

// Canonical site URL, baked in at build time.
//
// Vercel exposes the project's stable production domain (and keeps it correct
// if a custom domain is added later), so its builds resolve this themselves.
// The GitHub Pages build has no such variable and uses SITE_URL below, which
// must name the same canonical host so both copies agree on which is primary.
const SITE_URL = "https://bjornclind.github.io";

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : process.env.NEXT_PUBLIC_SITE_URL || SITE_URL;
const description =
  "Portfolio of Bjorn Lindqvist, a full stack engineer who designs, builds " +
  "and maintains web systems end to end.";

export const metadata: Metadata = {
  // Required so the Open Graph/Twitter image paths below resolve to absolute URLs.
  metadataBase: new URL(siteUrl),
  title: "Bjorn Lindqvist | Full Stack Engineer",
  description,
  keywords: [
    "Bjorn Lindqvist",
    "full stack engineer",
    "web systems analyst",
    "Next.js",
    "React",
    "TypeScript",
    "portfolio",
  ],
  authors: [{ name: "Bjorn Lindqvist", url: siteUrl }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Bjorn Lindqvist",
    title: "Bjorn Lindqvist | Full Stack Engineer",
    description,
    // logo.jpg is square (1120x1120). Swap in a 1200x630 banner and update
    // these dimensions + the twitter card below to get large link previews.
    images: [{ url: "/logo.jpg", width: 1120, height: 1120, alt: "Bjorn Lindqvist" }],
  },
  twitter: {
    card: "summary",
    title: "Bjorn Lindqvist | Full Stack Engineer",
    description,
    images: ["/logo.jpg"],
  },
};

// Vercel sets this during its builds; the GitHub Pages build does not.
const onVercel = Boolean(process.env.VERCEL);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.jpg" sizes="any" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        {onVercel && <SpeedInsights />}
      </body>
    </html>
  );
}
