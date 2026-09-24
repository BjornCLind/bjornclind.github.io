"use client";

import { useEffect, useRef } from "react";
import { animate, createAnimatable, stagger } from "animejs";

const GLYPHS = "abcdefghijklmnopqrstuvwxyz#%&*+=/<>";
const LIFT = 14; // px a letter rises when the pointer is right on it
const RADIUS = 150; // px of influence around the pointer

/**
 * The hero headline, split into letters so it can respond to the reader:
 *
 * - on load the accent phrase scrambles and resolves left to right, raw input
 *   decoding into software;
 * - with a mouse, letters near the pointer lift, and the accent re-scrambles
 *   when hovered;
 * - a click or tap sends a ripple through the text from that point.
 *
 * The letters are only ever moved or re-lettered, never hidden, and the full
 * sentence is also given as plain text for screen readers and search.
 */
export default function HeroHeadline({
  lead,
  accent,
  className,
}: {
  lead: string;
  accent: string;
  className?: string;
}) {
  const visualRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const visual = visualRef.current;
    if (!visual) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const chars = Array.from(visual.querySelectorAll<HTMLElement>("[data-ch]"));
    const accentChars = chars.filter((c) => c.dataset.accent === "true");
    const cleanups: Array<() => void> = [];

    // ---- Scramble -------------------------------------------------------
    let scrambling: ReturnType<typeof animate> | null = null;
    let deadline = 0;

    const restore = () => {
      accentChars.forEach((c) => {
        c.textContent = c.dataset.ch ?? "";
        c.style.width = "";
      });
    };

    const scramble = () => {
      scrambling?.pause();
      window.clearTimeout(deadline);
      restore();
      // Lock each slot to its final width so the line does not jitter as
      // glyphs of different widths pass through it.
      accentChars.forEach((c) => {
        c.style.width = c.getBoundingClientRect().width + "px";
      });
      const n = accentChars.length;
      const state = { p: 0 };
      scrambling = animate(state, {
        p: 1,
        duration: 1150,
        ease: "linear",
        onUpdate: () => {
          accentChars.forEach((c, i) => {
            const final = c.dataset.ch ?? "";
            const settleAt = 0.12 + (i / n) * 0.8;
            c.textContent =
              state.p >= settleAt || final === "."
                ? final
                : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          });
        },
        onComplete: restore,
      });
      // A starved animation must not leave the phrase as noise.
      deadline = window.setTimeout(restore, 1150 + 500);
    };

    const intro = window.setTimeout(scramble, 450);
    cleanups.push(() => {
      window.clearTimeout(intro);
      window.clearTimeout(deadline);
      scrambling?.pause();
      restore();
    });

    // ---- Ripple on click or tap ------------------------------------------
    const onClick = (e: MouseEvent) => {
      let nearest = 0;
      let best = Infinity;
      chars.forEach((c, i) => {
        const r = c.getBoundingClientRect();
        const d = Math.hypot(r.left + r.width / 2 - e.clientX, r.top + r.height / 2 - e.clientY);
        if (d < best) {
          best = d;
          nearest = i;
        }
      });
      animate(chars, {
        scale: [1, 1.26, 1],
        duration: 560,
        delay: stagger(14, { from: nearest }),
        ease: "outQuad",
      });
      if (accentChars.includes(chars[nearest])) scramble();
    };
    visual.addEventListener("click", onClick);
    cleanups.push(() => visual.removeEventListener("click", onClick));

    // ---- Pointer proximity (mouse only) ---------------------------------
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (finePointer) {
      const lifts = chars.map((c) => createAnimatable(c, { y: 420, ease: "out(4)" }));

      // Offsets are cached relative to the headline, which transforms do not
      // affect, so the lifted letters do not feed back into the maths.
      let centres: Array<{ x: number; y: number }> = [];
      const measure = () => {
        centres = chars.map((c) => ({
          x: c.offsetLeft + c.offsetWidth / 2,
          y: c.offsetTop + c.offsetHeight / 2,
        }));
      };
      measure();
      const ro = new ResizeObserver(measure);
      ro.observe(visual);
      document.fonts?.ready.then(measure);

      const onMove = (e: PointerEvent) => {
        const box = visual.getBoundingClientRect();
        const px = e.clientX - box.left;
        const py = e.clientY - box.top;
        centres.forEach((c, i) => {
          const t = Math.max(0, 1 - Math.hypot(c.x - px, c.y - py) / RADIUS);
          lifts[i].y(-t * t * LIFT);
        });
      };
      const onLeave = () => lifts.forEach((l) => l.y(0));

      const hero = visual.closest("section") ?? visual;
      hero.addEventListener("pointermove", onMove as EventListener);
      hero.addEventListener("pointerleave", onLeave);

      const accentWrap = visual.querySelector<HTMLElement>("[data-accent-wrap]");
      accentWrap?.addEventListener("pointerenter", scramble);

      cleanups.push(() => {
        ro.disconnect();
        hero.removeEventListener("pointermove", onMove as EventListener);
        hero.removeEventListener("pointerleave", onLeave);
        accentWrap?.removeEventListener("pointerenter", scramble);
        chars.forEach((c) => (c.style.transform = ""));
      });
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);

  const renderWords = (text: string, isAccent: boolean) =>
    text.split(" ").map((word, w, all) => (
      <span key={word + w}>
        <span className="inline-block whitespace-nowrap">
          {Array.from(word).map((ch, i) => (
            <span
              key={i}
              data-ch={ch}
              data-accent={isAccent ? "true" : undefined}
              className="inline-block origin-bottom text-center will-change-transform"
            >
              {ch}
            </span>
          ))}
        </span>
        {w < all.length - 1 ? " " : null}
      </span>
    ));

  return (
    <h1 className={className}>
      <span className="sr-only">
        {lead} {accent}
      </span>
      <span ref={visualRef} aria-hidden="true" className="relative block cursor-default select-none">
        {renderWords(lead, false)}{" "}
        <span data-accent-wrap className="text-purple">
          {renderWords(accent, true)}
        </span>
      </span>
    </h1>
  );
}
