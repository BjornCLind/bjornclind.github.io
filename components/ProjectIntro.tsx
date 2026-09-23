"use client";

import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";

/**
 * Staggered entrance for a project page's content. Falls back to simply being
 * visible when reduced motion is preferred, and the markup is never hidden by
 * CSS, so the content is readable if this never runs.
 */
export default function ProjectIntro({
  children,
}: {
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const targets = Array.from(
      root.querySelectorAll<HTMLElement>("[data-reveal]")
    );
    if (targets.length === 0) return;

    targets.forEach((el) => {
      el.style.opacity = "0";
    });

    const animation = animate(targets, {
      opacity: [0, 1],
      translateY: [14, 0],
      duration: 620,
      delay: stagger(80),
      ease: "outQuad",
    });

    return () => {
      animation.pause();
      // Leave the content visible if this unmounts mid-flight.
      targets.forEach((el) => {
        el.style.opacity = "";
        el.style.transform = "";
      });
    };
  }, []);

  return <div ref={ref}>{children}</div>;
}
