"use client";

import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import { prefersReducedMotion, useMotionSetting } from "@/lib/motion";

/**
 * Fades and lifts its `[data-reveal]` descendants in as the section scrolls
 * into view.
 *
 * Content is never hidden by CSS, only by this effect once it has run, so the
 * page reads normally without JavaScript. Reduced motion skips it entirely.
 *
 * Nothing here may depend on the rendering loop alone to bring content back.
 * IntersectionObserver callbacks and animation frames both stop when a tab is
 * hidden or throttled, which would leave hidden sections hidden for good. So a
 * timer -- which keeps running when rendering does not -- also checks for
 * elements that have scrolled into view, and every animated batch has a
 * deadline after which it is forced to its final state.
 */
export default function Reveal({
  children,
  className,
  as: Tag = "div",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "footer";
  id?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const motion = useMotionSetting();

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (prefersReducedMotion()) return;

    const targets = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (targets.length === 0) return;

    // Only hide what is still below the fold; anything already on screen at
    // load stays put rather than flashing out and back in.
    const below = targets.filter(
      (el) => el.getBoundingClientRect().top > window.innerHeight * 0.92
    );
    below.forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(16px)";
    });

    const timers: number[] = [];
    const settle = (els: HTMLElement[]) =>
      els.forEach((el) => {
        el.style.opacity = "";
        el.style.transform = "";
      });

    const show = (els: HTMLElement[]) => {
      animate(els, {
        opacity: [0, 1],
        translateY: [16, 0],
        duration: 700,
        delay: stagger(70),
        ease: "outQuart",
      });
      timers.push(window.setTimeout(() => settle(els), 700 + els.length * 70 + 600));
    };

    const pending = new Set(below);

    const reveal = (els: HTMLElement[]) => {
      const fresh = els.filter((el) => pending.has(el));
      if (fresh.length === 0) return;
      fresh.forEach((el) => {
        pending.delete(el);
        io.unobserve(el);
      });
      show(fresh);
      if (pending.size === 0) window.clearInterval(poll);
    };

    const io = new IntersectionObserver(
      (entries) =>
        reveal(
          entries.filter((e) => e.isIntersecting).map((e) => e.target as HTMLElement)
        ),
      { rootMargin: "0px 0px -8% 0px" }
    );
    below.forEach((el) => io.observe(el));

    // Backstop for when the observer is not being serviced.
    const poll = window.setInterval(() => {
      const limit = window.innerHeight * 0.92;
      reveal(
        Array.from(pending).filter((el) => {
          const r = el.getBoundingClientRect();
          return r.top < limit && r.bottom > 0;
        })
      );
    }, 450);

    return () => {
      io.disconnect();
      window.clearInterval(poll);
      timers.forEach((t) => window.clearTimeout(t));
      settle(below);
    };
  }, [motion]);

  return (
    <Tag
      ref={ref as React.RefObject<HTMLDivElement>}
      className={className}
      id={id}
    >
      {children}
    </Tag>
  );
}
