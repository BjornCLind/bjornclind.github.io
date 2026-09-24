"use client";

import { useEffect, useRef } from "react";
import { animate, createDrawable, createSpring, morphTo, stagger, utils } from "animejs";

export type GlyphKind = "rag" | "scan" | "records";

const INK = "#BEC1DD";
const ACCENT = "#CBACF9";

// Retrieval: a query point and the chunks it pulls in.
const QUERY = { x: 44, y: 26 };
const CHUNKS = [
  { x: 14, y: 12, hit: false },
  { x: 32, y: 8, hit: true },
  { x: 20, y: 40, hit: true },
  { x: 60, y: 44, hit: true },
  { x: 72, y: 14, hit: true },
  { x: 82, y: 36, hit: false },
  { x: 6, y: 30, hit: false },
];

// Scan: handwriting that straightens as the head passes.
const WAVES = [
  "M8 14 C16 9 22 19 30 14 S44 9 52 14 S66 19 80 13",
  "M8 26 C18 21 24 31 34 26 S48 21 58 26 S70 31 80 26",
  "M8 38 C14 34 22 43 30 38 S42 33 50 38 S66 43 72 38",
];
const LINES = ["M8 14 L80 14", "M8 26 L80 26", "M8 38 L72 38"];

// Records: rows that start out of true and file into place.
const ROWS = [
  { y: 10, x: -7, dy: 4, r: -13 },
  { y: 20, x: 9, dy: -3, r: 10 },
  { y: 30, x: -4, dy: 5, r: -7 },
  { y: 40, x: 11, dy: 1, r: 15 },
];

/**
 * A small moving preview of what each project page does. It plays once as it
 * scrolls into view, which is how phones see it, and again on hover or focus
 * of its row. It is decorative: its resting state is complete and nothing
 * depends on it running.
 */
export default function ProjectGlyph({ kind }: { kind: GlyphKind }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let activate: () => void;
    let deactivate: () => void;

    if (kind === "rag") {
      const lines = createDrawable(svg.querySelectorAll("[data-link]"), 0, 0);
      const hits = svg.querySelectorAll("[data-hit]");
      const query = svg.querySelector("[data-query]");
      activate = () => {
        animate(lines, { draw: "0 1", duration: 480, delay: stagger(80), ease: "outQuad" });
        animate(hits, { r: 3.4, fill: ACCENT, duration: 400, delay: stagger(80, { start: 200 }) });
        if (query) animate(query, { r: [3.2, 5, 3.6], duration: 600, ease: "outQuad" });
      };
      deactivate = () => {
        animate(lines, { draw: "0 0", duration: 380, ease: "inQuad" });
        animate(hits, { r: 2.4, fill: INK, duration: 380 });
      };
    } else if (kind === "scan") {
      const waves = Array.from(svg.querySelectorAll<SVGPathElement>("[data-wave]"));
      const straight = Array.from(svg.querySelectorAll<SVGPathElement>("[data-straight]"));
      const curved = Array.from(svg.querySelectorAll<SVGPathElement>("[data-curved]"));
      const head = svg.querySelector("[data-head]");
      activate = () => {
        if (head) animate(head, { x: [0, 74], opacity: [1, 1, 0], duration: 900, ease: "inOutSine" });
        waves.forEach((w, i) =>
          animate(w, {
            d: morphTo(straight[i]),
            stroke: ACCENT,
            duration: 800,
            delay: 80 + i * 60,
            ease: "inOutQuad",
          })
        );
      };
      deactivate = () => {
        waves.forEach((w, i) =>
          animate(w, { d: morphTo(curved[i]), stroke: INK, duration: 500, ease: "outQuad" })
        );
      };
    } else {
      const rows = Array.from(svg.querySelectorAll<SVGGElement>("[data-row]"));
      // Groups, not rects: on an SVG shape anime.js writes x/y as geometry
      // attributes, whereas a <g> takes a transform.
      rows.forEach((g, i) =>
        utils.set(g, { x: ROWS[i].x, y: ROWS[i].dy, rotate: ROWS[i].r })
      );
      activate = () =>
        animate(rows, {
          x: 0,
          y: 0,
          rotate: 0,
          delay: stagger(70),
          ease: createSpring({ stiffness: 160, damping: 13 }),
        });
      deactivate = () =>
        rows.forEach((g, i) =>
          animate(g, { x: ROWS[i].x, y: ROWS[i].dy, rotate: ROWS[i].r, duration: 450, ease: "outQuad" })
        );
    }

    // Play once on first sight: the only way a touch screen gets to see it.
    let demoTimer = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        activate();
        demoTimer = window.setTimeout(deactivate, 1900);
      },
      { threshold: 0.6 }
    );
    io.observe(svg);

    // Then follow the row it sits in.
    const row = svg.closest("a");
    const on = () => {
      window.clearTimeout(demoTimer);
      activate();
    };
    const off = () => deactivate();
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (row && fine) {
      row.addEventListener("pointerenter", on);
      row.addEventListener("pointerleave", off);
    }
    row?.addEventListener("focusin", on);
    row?.addEventListener("focusout", off);

    return () => {
      io.disconnect();
      window.clearTimeout(demoTimer);
      row?.removeEventListener("pointerenter", on);
      row?.removeEventListener("pointerleave", off);
      row?.removeEventListener("focusin", on);
      row?.removeEventListener("focusout", off);
    };
  }, [kind]);

  return (
    <svg
      ref={ref}
      viewBox="0 0 88 52"
      aria-hidden="true"
      className="h-8 w-14 overflow-visible sm:h-[52px] sm:w-[88px]"
      fill="none"
    >
      {kind === "rag" && (
        <>
          {CHUNKS.filter((c) => c.hit).map((c) => (
            <path
              key={`l${c.x}`}
              data-link
              d={`M${QUERY.x} ${QUERY.y} L${c.x} ${c.y}`}
              stroke={ACCENT}
              strokeOpacity="0.7"
              strokeWidth="1.2"
            />
          ))}
          {CHUNKS.map((c) => (
            <circle
              key={`c${c.x}`}
              data-hit={c.hit ? true : undefined}
              cx={c.x}
              cy={c.y}
              r="2.4"
              fill={INK}
              fillOpacity={c.hit ? 0.9 : 0.45}
            />
          ))}
          <circle data-query cx={QUERY.x} cy={QUERY.y} r="3.2" fill={ACCENT} />
        </>
      )}

      {kind === "scan" && (
        <>
          <defs>
            {LINES.map((d, i) => (
              <path key={`s${i}`} data-straight d={d} />
            ))}
            {WAVES.map((d, i) => (
              <path key={`c${i}`} data-curved d={d} />
            ))}
          </defs>
          {WAVES.map((d, i) => (
            <path
              key={`w${i}`}
              data-wave
              d={d}
              stroke={INK}
              strokeOpacity="0.75"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          ))}
          <g data-head opacity="0">
            <rect x="6" y="4" width="2" height="44" rx="1" fill={ACCENT} />
          </g>
        </>
      )}

      {kind === "records" &&
        ROWS.map((row) => (
          <g key={row.y} data-row style={{ transformOrigin: `44px ${row.y + 2}px` }}>
            <rect x="10" y={row.y} width="68" height="5" rx="1.5" fill={INK} fillOpacity="0.28" />
            <rect x="10" y={row.y} width="2" height="5" fill={ACCENT} />
            <rect x="16" y={row.y + 1.5} width="18" height="2" rx="1" fill={INK} fillOpacity="0.7" />
            <rect x="40" y={row.y + 1.5} width="14" height="2" rx="1" fill={INK} fillOpacity="0.5" />
          </g>
        ))}
    </svg>
  );
}
