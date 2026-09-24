"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "animejs";

/**
 * The title arrives as handwriting and is transcribed by a scanner head that
 * sweeps across it. Everything left of the head is digitized type; everything
 * right of it is still handwriting.
 *
 * After the first pass the head follows the pointer, so the reader can scrub
 * back and forth across the boundary and watch the transcription reverse.
 *
 * Only the typed layer carries the real text; the handwriting layer and the
 * scanner head are decorative.
 */
export default function ScanlineTitle({
  text,
  handwritingClassName,
  className,
}: {
  text: string;
  handwritingClassName: string;
  className?: string;
}) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const [scrubbable, setScrubbable] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const setScan = (pct: number) => {
      wrap.style.setProperty("--scan", pct + "%");
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setScan(100);
      return;
    }

    // Opening pass: handwriting transcribed left to right.
    const progress = { p: 0 };
    setScan(0);
    wrap.dataset.scanning = "true";

    const sweep = animate(progress, {
      p: 100,
      duration: 2100,
      delay: 350,
      ease: "inOutQuad",
      onUpdate: () => setScan(progress.p),
      onComplete: () => {
        delete wrap.dataset.scanning;
        setScrubbable(true);
      },
    });

    return () => {
      sweep.pause();
      delete wrap.dataset.scanning;
    };
  }, []);

  // Once the opening pass is done the head tracks the pointer across the title.
  useEffect(() => {
    if (!scrubbable) return;
    const wrap = wrapRef.current;
    if (!wrap) return;

    let settle: ReturnType<typeof animate> | null = null;

    const onMove = (e: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      // Track only while the pointer is roughly over the title band.
      if (
        e.clientY < rect.top - 40 ||
        e.clientY > rect.bottom + 40 ||
        e.clientX < rect.left - 120 ||
        e.clientX > rect.right + 120
      ) {
        return;
      }
      settle?.pause();
      settle = null;
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      wrap.dataset.scanning = "true";
      wrap.style.setProperty("--scan", Math.max(0, Math.min(100, pct)) + "%");
    };

    const onLeave = () => {
      // Finish the transcription again when the pointer moves away.
      const current = parseFloat(
        wrap.style.getPropertyValue("--scan") || "100"
      );
      const progress = { p: Number.isFinite(current) ? current : 100 };
      settle = animate(progress, {
        p: 100,
        duration: 650,
        ease: "outQuad",
        onUpdate: () => wrap.style.setProperty("--scan", progress.p + "%"),
        onComplete: () => {
          delete wrap.dataset.scanning;
        },
      });
    };

    window.addEventListener("pointermove", onMove);
    document.addEventListener("pointerleave", onLeave);
    wrap.addEventListener("pointerleave", onLeave);

    return () => {
      settle?.pause();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      wrap.removeEventListener("pointerleave", onLeave);
    };
  }, [scrubbable]);

  return (
    <span
      ref={wrapRef}
      className={"scanline-title " + (className ?? "")}
      style={{ ["--scan" as string]: "0%" }}
    >
      {/* Handwriting: still to be transcribed, to the right of the head. */}
      <span
        aria-hidden="true"
        className={"scanline-title__ink " + handwritingClassName}
      >
        {text}
      </span>

      {/* The real, accessible text. Clipped, which does not hide it from
          assistive tech. */}
      <span className="scanline-title__type">{text}</span>

      <span aria-hidden="true" className="scanline-title__head" />
    </span>
  );
}
