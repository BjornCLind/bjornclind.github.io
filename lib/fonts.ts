import { Caveat } from "next/font/google";

/**
 * Handwriting face for the microfilm project's scan effect. Declared here and
 * applied only on that page, so next/font scopes the download to the route
 * that actually uses it.
 */
export const handwriting = Caveat({
  subsets: ["latin"],
  weight: ["600"],
  display: "swap",
  variable: "--font-handwriting",
});
