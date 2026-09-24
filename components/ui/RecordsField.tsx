"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { animate, createSpring, stagger } from "animejs";

type Row = {
  /** Resting position, in px from the top of the field. */
  top: number;
  /** Where the row starts out before it is filed: offset and rotation. */
  fromX: number;
  fromY: number;
  fromRotate: number;
  /** How full each column's cell is, as a fraction. Varies per row, but the
   *  column boundaries themselves do not: that is what reads as a schema. */
  fills: number[];
};

const ROW_HEIGHT = 30;
const MAX_ROWS = 14;

/** One shared column template for every row, so the columns line up. */
const COLUMNS = [1.5, 1, 0.7, 1.25, 0.55];

/**
 * Loose records being filed into one structure: the rows arrive scattered and
 * out of true, then settle into an aligned table. Pulling a row out of line
 * springs it straight back, which is the validation-at-entry idea made
 * physical.
 *
 * The cells are deliberately abstract. This describes a records system for a
 * police department, so inventing plausible-looking entries would be worse
 * than showing none.
 */
export default function RecordsField({ className }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const settledRef = useRef(false);

  // Build the table once the field has been measured.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const build = () => {
      const { width, height } = wrap.getBoundingClientRect();
      if (width === 0 || height === 0) return;

      // Start below the header band so the table never sits behind the title.
      const offset = Math.round(height * 0.2);
      const usable = height - offset;
      const count = Math.max(6, Math.min(MAX_ROWS, Math.floor(usable / ROW_HEIGHT)));
      const spread = Math.min(width * 0.5, 220);

      setRows(
        Array.from({ length: count }, (_, i) => ({
          top: offset + i * ROW_HEIGHT,
          fromX: (Math.random() - 0.5) * spread,
          fromY: (Math.random() - 0.5) * 90,
          fromRotate: (Math.random() - 0.5) * 14,
          fills: COLUMNS.map(() => 0.45 + Math.random() * 0.55),
        }))
      );
    };

    build();
    const ro = new ResizeObserver(build);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  /** Animate the rows from scattered into alignment. */
  const fileRows = useCallback(() => {
    const wrap = wrapRef.current;
    if (!wrap || settledRef.current) return;
    const targets = wrap.querySelectorAll<HTMLElement>("[data-row]");
    if (targets.length === 0) return;
    settledRef.current = true;

    animate(targets, {
      x: 0,
      y: 0,
      rotate: 0,
      opacity: [0, 1],
      duration: 1200,
      delay: stagger(55),
      ease: createSpring({ stiffness: 110, damping: 16 }),
    });
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || rows.length === 0) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Show the filed table, no arrival.
      wrap.querySelectorAll<HTMLElement>("[data-row]").forEach((el) => {
        el.style.transform = "none";
        el.style.opacity = "1";
      });
      return;
    }

    // Wait until the field is actually on screen before filing the rows.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          fileRows();
          io.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    io.observe(wrap);
    return () => io.disconnect();
  }, [rows, fileRows]);

  // Drag a row out of line; it springs back when released.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || rows.length === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let held: HTMLElement | null = null;
    let origin = { x: 0, y: 0 };

    const onDown = (e: PointerEvent) => {
      if (!settledRef.current) return;
      // The rows run behind the article, and starting a drag there would
      // swallow text selection and clicks. Only the parts of a row that run
      // past the text column are draggable.
      const target = e.target;
      if (target instanceof Element && target.closest("article")) return;

      // The rows sit behind the article, so hit-test them by position rather
      // than relying on the event reaching them.
      const hit = Array.from(
        wrap.querySelectorAll<HTMLElement>("[data-row]")
      ).find((el) => {
        const r = el.getBoundingClientRect();
        return (
          e.clientX >= r.left &&
          e.clientX <= r.right &&
          e.clientY >= r.top &&
          e.clientY <= r.bottom
        );
      });
      if (!hit) return;

      held = hit;
      origin = { x: e.clientX, y: e.clientY };
      hit.style.transition = "none";
      e.preventDefault();
    };

    const onMove = (e: PointerEvent) => {
      if (!held) return;
      const dx = e.clientX - origin.x;
      const dy = e.clientY - origin.y;
      held.style.transform =
        "translate(" + dx + "px," + dy + "px) rotate(" + dx * 0.02 + "deg)";
    };

    const onUp = () => {
      if (!held) return;
      const el = held;
      held = null;
      // Snap back into the schema.
      animate(el, {
        x: 0,
        y: 0,
        rotate: 0,
        duration: 900,
        ease: createSpring({ stiffness: 140, damping: 13 }),
      });
    };

    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);

    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [rows]);

  return (
    <div ref={wrapRef} aria-hidden="true" className={"records-field " + (className ?? "")}>
      {rows.map((row, i) => (
        <div
          key={i}
          data-row
          className="records-row"
          style={{
            top: row.top,
            opacity: 0,
            transform:
              "translate(" +
              row.fromX +
              "px," +
              row.fromY +
              "px) rotate(" +
              row.fromRotate +
              "deg)",
          }}
        >
          {COLUMNS.map((width, j) => (
            <span key={j} className="records-col" style={{ flexGrow: width }}>
              <span
                className="records-cell"
                style={{ width: (row.fills[j] * 100).toFixed(1) + "%" }}
              />
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
