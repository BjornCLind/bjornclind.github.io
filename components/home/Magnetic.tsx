"use client";

import { useEffect, useRef } from "react";
import { createAnimatable } from "animejs";

const PULL = 0.3; // share of the pointer's offset the element follows
const REACH = 36; // px beyond the element's edge that still attracts it

/**
 * Leans its child towards a nearby mouse pointer and springs back when the
 * pointer moves away. Mouse only: on touch there is no pointer to follow, and
 * a button that drifts under a finger is worse than one that stays put.
 */
export default function Magnetic({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const pull = createAnimatable(el, { x: 550, y: 550, ease: "out(3)" });
    let engaged = false;

    const onMove = (e: PointerEvent) => {
      // Measure the untransformed box, so the pull does not chase itself.
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2 - (pull.x() as number);
      const cy = r.top + r.height / 2 - (pull.y() as number);
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const near =
        Math.abs(dx) < r.width / 2 + REACH && Math.abs(dy) < r.height / 2 + REACH;
      if (near) {
        engaged = true;
        pull.x(dx * PULL);
        pull.y(dy * PULL);
      } else if (engaged) {
        engaged = false;
        pull.x(0);
        pull.y(0);
      }
    };

    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("pointermove", onMove);
      el.style.transform = "";
    };
  }, []);

  return (
    <span ref={ref} className="inline-block will-change-transform">
      {children}
    </span>
  );
}
