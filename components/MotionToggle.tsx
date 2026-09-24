"use client";

import { useEffect, useState } from "react";

import { prefersReducedMotion, setReducedMotion, watchSystemMotion } from "@/lib/motion";

/**
 * Pauses every animation on the site: the globe, the project visuals, the
 * scroll reveals and Pixel Bjorn. Several of those loop indefinitely, and
 * anything that moves for more than five seconds needs a way to stop it.
 */
export default function MotionToggle() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(prefersReducedMotion());
    const sync = () => setReduced(prefersReducedMotion());
    window.addEventListener("motionchange", sync);
    const unwatch = watchSystemMotion();
    return () => {
      window.removeEventListener("motionchange", sync);
      unwatch();
    };
  }, []);

  const label = reduced ? "Animations paused" : "Pause animations";

  return (
    <button
      type="button"
      onClick={() => setReducedMotion(!reduced)}
      aria-pressed={reduced}
      aria-label="Pause animations"
      title={label}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-black-100/80 text-white-100 backdrop-blur transition hover:border-white/50 hover:text-white aria-pressed:border-purple aria-pressed:text-purple"
    >
      <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" fill="currentColor">
        {reduced ? (
          // Paused: offer play.
          <path d="M5 3.2v9.6a.6.6 0 0 0 .92.5l7.2-4.8a.6.6 0 0 0 0-1L5.92 2.7A.6.6 0 0 0 5 3.2Z" />
        ) : (
          <>
            <rect x="3.5" y="3" width="3" height="10" rx="0.8" />
            <rect x="9.5" y="3" width="3" height="10" rx="0.8" />
          </>
        )}
      </svg>
    </button>
  );
}
