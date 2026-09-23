// Canonical site URL, resolved at build time.
//
// Vercel exposes the project's stable production domain, and keeps it correct
// if a custom domain is added later. NEXT_PUBLIC_SITE_URL overrides it, and
// SITE_URL is the fallback for builds outside Vercel.
const SITE_URL = "https://bjornclind.github.io";

export const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : process.env.NEXT_PUBLIC_SITE_URL || SITE_URL;
