"use client";

import dynamic from "next/dynamic";

// anime.js and the canvas work only matter once a project page is open, and
// only for projects that declare a visual, so they stay out of every other
// chunk.
const NeuralField = dynamic(() => import("./ui/NeuralField"), { ssr: false });

const VISUALS = {
  "neural-field": NeuralField,
} as const;

export type VisualKey = keyof typeof VISUALS;

export default function ProjectVisual({ name }: { name: VisualKey }) {
  const Visual = VISUALS[name];
  if (!Visual) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-[115vh] overflow-hidden [mask-image:linear-gradient(to_bottom,black_0%,black_60%,transparent_100%)]">
      <Visual className="h-full w-full" />
    </div>
  );
}
