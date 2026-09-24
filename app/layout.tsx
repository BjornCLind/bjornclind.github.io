import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { SpeedInsights } from "@vercel/speed-insights/next";

import "./globals.css";
import { ThemeProvider } from "./provider";
import { siteUrl } from "@/lib/site";
import CompanionLoader from "@/components/companion/CompanionLoader";
import MotionToggle from "@/components/MotionToggle";
import { MOTION_BOOT } from "@/lib/motion";

const inter = Inter({ subsets: ["latin"] });

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
  },
  twitter: {
    card: "summary_large_image",
    title: "Bjorn Lindqvist | Full Stack Engineer",
    description,
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
        <script dangerouslySetInnerHTML={{ __html: MOTION_BOOT }} />
      </head>
      <body className={inter.className}>
        <a
          href="#main"
          className="sr-only rounded-full bg-white text-sm font-medium text-black-100 focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:px-5 focus:py-2.5"
        >
          Skip to content
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <aside
            aria-label="Display preferences"
            className="fixed bottom-4 left-4 flex items-center gap-2 print:hidden"
          >
            <MotionToggle />
            <CompanionLoader />
          </aside>
        </ThemeProvider>
        {onVercel && <SpeedInsights />}
      </body>
    </html>
  );
}
