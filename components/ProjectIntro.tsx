"use client";

import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import { prefersReducedMotion, useMotionSetting } from "@/lib/motion";

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
  const motion = useMotionSetting();

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (prefersReducedMotion()) return;

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

    // If the animation never gets to finish -- a heavily throttled or
    // backgrounded tab starves requestAnimationFrame -- the content must not
    // be left sitting at opacity 0.
    const failSafe = window.setTimeout(() => {
      targets.forEach((el) => {
        el.style.opacity = "";
        el.style.transform = "";
      });
    }, 4000);

    return () => {
      window.clearTimeout(failSafe);
      animation.pause();
      // Leave the content visible if this unmounts mid-flight.
      targets.forEach((el) => {
        el.style.opacity = "";
        el.style.transform = "";
      });
    };
  }, [motion]);

  return <div ref={ref}>{children}</div>;
}
