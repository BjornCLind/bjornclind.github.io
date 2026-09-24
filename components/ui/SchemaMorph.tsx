"use client";

import { useEffect, useRef } from "react";
import { createDrawable, createTimeline, morphTo, stagger, utils } from "animejs";

/**
 * Schematic side profile, drawn as six open strokes rather than one closed
 * shape so each stroke can later become a row of the table.
 */
const OUTLINE = [
  // Slide, top edge into the muzzle
  "M116 74 H366 L382 84",
  // Muzzle face and underside of the slide
  "M382 84 V102 H350",
  // Slide underside back to the rear face
  "M350 102 H150 V74",
  // Frame and trigger guard
  "M150 102 V124 H234 C234 158 298 158 298 124 H330 V102",
  // Trigger
  "M250 126 C250 144 266 146 268 130",
  // Grip
  "M150 124 L122 194 L168 206 L194 136",
];

/** Each stroke unravels into one horizontal rule of the table. */
const ROW_Y = [58, 84, 110, 136, 162, 188];
const target = (y: number) => `M60 ${y} H560`;

const COLUMNS = [
  { x: 70, label: "officer_id" },
  { x: 186, label: "weapon_serial" },
  { x: 322, label: "qual_date" },
  { x: 430, label: "score" },
  { x: 492, label: "status" },
];

/** Obvious placeholders: identifiers and codes, never names. */
const ROWS = [
  ["OFF-1042", "SN-44815", "2026-04-12", "94", "PASS"],
  ["OFF-1187", "SN-51220", "2026-04-12", "88", "PASS"],
  ["OFF-0931", "SN-39604", "2026-05-03", "71", "RETEST"],
  ["OFF-1265", "SN-60118", "2026-05-19", "96", "PASS"],
];

const INK = "#BEC1DD";
const ACCENT = "#CBACF9";

/**
 * The firearm is traced as a line drawing, then its strokes unravel and morph
 * into the rows of the table that records it.
 *
 * The table content is placeholder: identifiers and codes rather than names,
 * because this describes a real police records system.
 */
export default function SchemaMorph({ className }: { className?: string }) {
  const rootRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const strokes = Array.from(root.querySelectorAll<SVGPathElement>("[data-stroke]"));
    const dividers = Array.from(root.querySelectorAll<SVGPathElement>("[data-divider]"));
    const text = Array.from(root.querySelectorAll<SVGTextElement>("[data-cell]"));
    const caption = root.querySelector<SVGTextElement>("[data-caption]");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Land on the finished table with nothing moving.
      strokes.forEach((el, i) => {
        el.setAttribute("d", target(ROW_Y[i]));
        el.style.stroke = i === 0 ? ACCENT : INK;
        el.style.strokeOpacity = i === 0 ? "0.75" : "0.3";
      });
      utils.set(dividers, { opacity: 0.32 });
      utils.set(text, { opacity: 1 });
      if (caption) utils.set(caption, { opacity: 0 });
      return;
    }

    utils.set(dividers, { opacity: 0 });
    utils.set(text, { opacity: 0 });

    // createDrawable exposes a `draw` property, so the outline can be drawn on
    // with stroke-dashoffset rather than simply faded in.
    const drawables = createDrawable(strokes);

    const tl = createTimeline({ loop: true, defaults: { ease: "inOutQuad" } });

    // Absolute positions in ms. Each stroke has to be added on its own -- the
    // typed per-target function form does not accept morphTo -- so the phases
    // are placed explicitly rather than chained relatively.
    const TRACE = 0;
    const UNRAVEL = 2600;
    const FILL = 4250;
    const CLEAR = 8300;

    tl
      .set(strokes, { stroke: INK, strokeOpacity: 0.85 })
      .set(text, { opacity: 0 })
      .set(dividers, { opacity: 0 })
      .add(drawables, { draw: ["0 0", "0 1"], duration: 1500, delay: stagger(170) }, TRACE);

    if (caption) {
      tl.add(caption, { opacity: [0, 0.75], duration: 500 }, 700);
      tl.add(caption, { opacity: 0, duration: 400 }, UNRAVEL - 400);
    }

    // Unravel: every stroke becomes a rule of the table.
    strokes.forEach((el, i) => {
      tl.add(
        el,
        {
          d: morphTo("#sm-dst-" + i),
          stroke: ACCENT,
          strokeOpacity: 0.55,
          duration: 1400,
          ease: "inOutCubic",
        },
        UNRAVEL + i * 90
      );
    });

    tl
      // The schema fills in.
      .add(dividers, { opacity: [0, 0.32], duration: 500 }, FILL)
      .add(text, { opacity: [0, 1], duration: 420, delay: stagger(28) }, FILL + 150)

      // Hold the table, then clear and run again.
      .add(text, { opacity: 0, duration: 400, delay: stagger(16) }, CLEAR)
      .add(dividers, { opacity: 0, duration: 300 }, CLEAR)
      .add(strokes, { strokeOpacity: 0, duration: 400 }, CLEAR + 200)
      .call(() => {
        // Put the outline back so the next pass traces it again.
        strokes.forEach((el, i) => el.setAttribute("d", OUTLINE[i]));
      });

    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? tl.play() : tl.pause()),
      { threshold: 0.2 }
    );
    io.observe(root);

    return () => {
      io.disconnect();
      tl.pause();
    };
  }, []);

  return (
    <svg
      ref={rootRef}
      aria-hidden="true"
      viewBox="0 0 620 232"
      className={className}
      fill="none"
    >
      {/* Morph targets, never rendered. */}
      <defs>
        {ROW_Y.map((y, i) => (
          <path key={i} id={`sm-dst-${i}`} d={target(y)} />
        ))}
      </defs>

      {OUTLINE.map((d, i) => (
        <path
          key={i}
          data-stroke
          d={d}
          stroke={INK}
          strokeOpacity="0.85"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}

      {/* Column dividers, revealed once the rows exist. */}
      {COLUMNS.slice(1).map((c) => (
        <path
          key={c.label}
          data-divider
          d={`M${c.x - 12} 58 V${ROW_Y[ROW_Y.length - 1]}`}
          stroke={ACCENT}
          strokeWidth="1"
          opacity="0"
        />
      ))}

      <g
        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
        fontSize="12"
      >
        {/* Header */}
        {COLUMNS.map((c) => (
          <text
            key={c.label}
            data-cell
            x={c.x}
            y={ROW_Y[0] - 8}
            fill={ACCENT}
            fillOpacity="0.95"
            opacity="0"
          >
            {c.label}
          </text>
        ))}

        {/* Rows */}
        {ROWS.map((row, r) =>
          row.map((value, c) => (
            <text
              key={`${r}-${c}`}
              data-cell
              x={COLUMNS[c].x}
              y={ROW_Y[r + 1] - 8}
              fill={INK}
              fillOpacity={c === 4 && value !== "PASS" ? 0.95 : 0.72}
              opacity="0"
            >
              {value}
            </text>
          ))
        )}

        <text
          data-caption
          x="310"
          y="224"
          textAnchor="middle"
          fill={INK}
          fillOpacity="0.55"
          fontSize="11"
          opacity="0"
        >
          one qualification, before it is a record
        </text>
      </g>
    </svg>
  );
}
