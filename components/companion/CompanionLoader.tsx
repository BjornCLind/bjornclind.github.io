"use client";

import dynamic from "next/dynamic";

// Client-only and split into its own chunk: the companion has nothing to
// render on the server, and pages should not wait on it.
const Companion = dynamic(() => import("./Companion"), { ssr: false });

export default function CompanionLoader() {
  return <Companion />;
}
