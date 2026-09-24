"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

import RecordsPipeline from "./RecordsPipeline";

// three.js is ~650kB. It loads only for this one project page, only when the
// scene is close to being seen, and only if the browser can actually run it.
const CheckInScene = dynamic(() => import("./CheckInScene"), { ssr: false });

function canRunWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl2") || canvas.getContext("webgl"))
    );
  } catch {
    return false;
  }
}

/**
 * The 3D check-in, with the flat pipeline scene as the fallback.
 *
 * The fallback is not a nicety: a portfolio has to survive a visitor whose
 * machine cannot do WebGL, or who has asked for less motion, and a blank
 * rectangle where the showpiece should be is worse than no showpiece.
 */
export default function CheckIn3D({ className }: { className?: string }) {
  const [mode, setMode] = useState<"pending" | "three" | "flat">("pending");
  const [ref, setRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref) return;

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !canRunWebGL()
    ) {
      setMode("flat");
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMode("three");
          io.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    io.observe(ref);
    return () => io.disconnect();
  }, [ref]);

  if (mode === "flat") {
    return <RecordsPipeline className={className} />;
  }

  return (
    <div
      ref={setRef}
      aria-hidden="true"
      className={
        "relative w-full overflow-hidden rounded-2xl border border-black-300 bg-black-100 " +
        (className ?? "")
      }
      style={{ aspectRatio: "16 / 10" }}
    >
      {mode === "three" && <CheckInScene />}
    </div>
  );
}
