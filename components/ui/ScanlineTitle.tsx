"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { animate } from "animejs";

/**
 * The title arrives as handwriting and is transcribed by a scanner head that
 * sweeps across it. Everything left of the head is digitized type, everything
 * right of it is still handwriting.
 *
 * After the first pass the head follows the pointer, so the reader can scrub
 * back and forth across the boundary and watch the transcription reverse.
 *
 * The two faces have different metrics and would wrap and sit differently, so
 * the typed layer owns the layout and every handwritten word is measured onto
 * its typed counterpart. That keeps the line breaks and word positions
 * identical, which is what makes the boundary read as one piece of text being
 * converted rather than two texts cross-fading.
 *
 * Only the typed layer carries the real text; the handwriting and the scanner
 * head are decorative.
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
  const typeRef = useRef<HTMLSpanElement>(null);
  const inkRef = useRef<HTMLSpanElement>(null);
  const [scrubbable, setScrubbable] = useState(false);

  const words = text.split(" ");

  /** Lay each handwritten word over the typed word it transcribes. */
  const alignInk = useCallback(() => {
    const wrap = wrapRef.current;
    const typeLayer = typeRef.current;
    const inkLayer = inkRef.current;
    if (!wrap || !typeLayer || !inkLayer) return;

    const typed = typeLayer.querySelectorAll<HTMLElement>("[data-word]");
    const ink = inkLayer.querySelectorAll<HTMLElement>("[data-word]");
    if (typed.length !== ink.length) return;

    const origin = wrap.getBoundingClientRect();

    for (let i = 0; i < typed.length; i++) {
      const box = typed[i].getBoundingClientRect();
      const inkWord = ink[i];

      // Measure the handwriting at its natural width before scaling it.
      inkWord.style.transform = "none";
      inkWord.style.left = box.left - origin.left + "px";
      inkWord.style.top = box.top - origin.top + "px";
      const natural = inkWord.getBoundingClientRect().width;

      const scale = natural > 0 ? box.width / natural : 1;
      // Clamp so an outlier word is never stretched into mush.
      inkWord.style.transform =
        "scaleX(" + Math.max(0.7, Math.min(1.6, scale)) + ")";
    }

    inkLayer.style.opacity = "1";
  }, []);

  useLayoutEffect(() => {
    alignInk();

    // The server renders the finished, typed title: the handwriting layer is
    // hidden until it has been measured, so starting at 0% there would leave
    // the heading blank until hydration, and blank for good without JS. The
    // sweep is wound back to its start here, before the browser paints.
    const wrap = wrapRef.current;
    if (!wrap) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    wrap.style.setProperty("--scan", "0%");
  }, [alignInk]);

  // Re-measure once the webfont is swapped in, and whenever the title reflows.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) alignInk();
    });

    const ro = new ResizeObserver(() => alignInk());
    ro.observe(wrap);

    return () => {
      cancelled = true;
      ro.disconnect();
    };
  }, [alignInk]);

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

    // Opening pass: handwriting transcribed left to right. The starting
    // position was set in the layout effect above, before paint.
    const progress = { p: 0 };
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
      style={{ ["--scan" as string]: "100%" }}
    >
      {/* The real, accessible text, and the layer that owns the layout.
          Clipping does not hide it from assistive tech. */}
      <span ref={typeRef} className="scanline-title__type">
        {words.map((word, i) => (
          <span key={i}>
            <span data-word>{word}</span>
            {i < words.length - 1 ? " " : null}
          </span>
        ))}
      </span>

      {/* Handwriting: still to be transcribed, to the right of the head. */}
      <span
        ref={inkRef}
        aria-hidden="true"
        className={"scanline-title__ink " + handwritingClassName}
      >
        {words.map((word, i) => (
          <span key={i} data-word>
            {word}
          </span>
        ))}
      </span>

      <span aria-hidden="true" className="scanline-title__head" />
    </span>
  );
}
