"use client";

import { useEffect, useRef } from "react";
import { animate, createTimer, stagger } from "animejs";
import { prefersReducedMotion, useMotionSetting } from "@/lib/motion";

type Node = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Animated by anime.js on entrance, then held at 1. */
  scale: number;
  /** Eased toward 1 while the node sits inside the query radius. */
  heat: number;
  /** 0.45 (far) to 1 (near). Drives size, opacity and drift speed so the
   *  field reads as layered rather than flat. */
  depth: number;
};

const LINK_DISTANCE = 152;
const QUERY_RADIUS = 210;
const GRAB_RADIUS = 28;
const NODE_RADIUS = 3.6;

const COLOR_NODE = "190, 193, 221"; // white-100
const COLOR_HOT = "203, 172, 249"; // purple

/**
 * Document chunks drifting in embedding space. The pointer acts as the query:
 * chunks inside the query radius warm up and link to it, which is the same
 * nearest-neighbour idea the retrieval step uses. Chunks can be grabbed and
 * thrown.
 *
 * Decorative, so it is hidden from assistive tech, and it renders a single
 * static frame when the visitor prefers reduced motion.
 */
export default function NeuralField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const motion = useMotionSetting();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = prefersReducedMotion();
    // Phones and tablets have no hovering cursor, so there is nothing to drive
    // the query point. On those the query moves itself, and a tap re-aims it.
    const noHover = window.matchMedia("(hover: none)").matches;

    let width = 0;
    let height = 0;
    let nodes: Node[] = [];

    // Fixed pixel radii read very differently on a phone than on a desktop:
    // at 375px wide, a 210px query radius covers most of the screen. Scale
    // them down on narrow viewports so the field keeps the same proportions.
    let linkDistance = LINK_DISTANCE;
    let queryRadius = QUERY_RADIUS;
    const scaleRadii = () => {
      const factor = Math.max(0.62, Math.min(1, width / 900));
      linkDistance = LINK_DISTANCE * factor;
      queryRadius = QUERY_RADIUS * factor;
    };

    const pointer = { x: -9999, y: -9999, active: false };
    let autoQuery = Math.random() * Math.PI * 2;
    let grabbed: Node | null = null;
    let lastGrabPos = { x: 0, y: 0 };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      scaleRadii();
    };

    const seed = () => {
      // Scaled to area, and capped: the link pass is O(n^2).
      const density = Math.round((width * height) / 13000);
      const count = Math.max(24, Math.min(width < 640 ? 34 : 78, density));
      nodes = Array.from({ length: count }, () => {
        const depth = 0.45 + Math.random() * 0.55;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          // Nearer nodes drift faster, which reads as parallax.
          vx: (Math.random() - 0.5) * 0.3 * depth,
          vy: (Math.random() - 0.5) * 0.3 * depth,
          scale: reduceMotion ? 1 : 0,
          heat: 0,
          depth,
        };
      });
    };

    // Resize must not re-seed: ResizeObserver fires as soon as it observes,
    // and replacing the array there would orphan the entrance animation, which
    // holds references to the original node objects.
    const fitToBounds = () => {
      resize();
      for (const n of nodes) {
        n.x = Math.max(0, Math.min(width, n.x));
        n.y = Math.max(0, Math.min(height, n.y));
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Links between nearby chunks.
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist > linkDistance) continue;

          const strength = 1 - dist / linkDistance;
          const hot = Math.max(a.heat, b.heat);
          const near = (a.depth + b.depth) / 2;
          const color = hot > 0.1 ? COLOR_HOT : COLOR_NODE;
          ctx.strokeStyle =
            "rgba(" + color + ", " + strength * 0.34 * near * (1 + hot) + ")";
          ctx.lineWidth = (0.5 + hot * 0.8) * near;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      // Retrieval links from the query to its nearest chunks.
      if (pointer.active) {
        for (const n of nodes) {
          if (n.heat <= 0.02) continue;
          ctx.strokeStyle = "rgba(" + COLOR_HOT + ", " + n.heat * 0.55 + ")";
          ctx.lineWidth = 0.7 + n.heat;
          ctx.beginPath();
          ctx.moveTo(pointer.x, pointer.y);
          ctx.lineTo(n.x, n.y);
          ctx.stroke();
        }
      }

      for (const n of nodes) {
        const r = NODE_RADIUS * n.depth * n.scale * (1 + n.heat * 0.9);
        if (r <= 0) continue;

        // Soft halo: always a faint one so the field has body, brighter while
        // the node is being retrieved.
        const haloAlpha = 0.05 * n.depth + 0.16 * n.heat;
        ctx.fillStyle =
          "rgba(" + (n.heat > 0.05 ? COLOR_HOT : COLOR_NODE) + ", " + haloAlpha + ")";
        ctx.beginPath();
        ctx.arc(n.x, n.y, r * (2.6 + n.heat * 2), 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle =
          n.heat > 0.05
            ? "rgba(" + COLOR_HOT + ", " + (0.55 + n.heat * 0.45) + ")"
            : "rgba(" + COLOR_NODE + ", " + (0.28 + n.depth * 0.46) + ")";
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const step = () => {
      if (noHover && !grabbed) {
        // A slow wander, so the retrieval behaviour is visible without input.
        autoQuery += 0.0042;
        pointer.x = width * (0.5 + 0.3 * Math.cos(autoQuery));
        pointer.y = height * (0.42 + 0.24 * Math.sin(autoQuery * 1.6));
        pointer.active = true;
      }

      for (const n of nodes) {
        if (n === grabbed) {
          n.heat = 1;
          continue;
        }

        n.x += n.vx;
        n.y += n.vy;

        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
        n.x = Math.max(0, Math.min(width, n.x));
        n.y = Math.max(0, Math.min(height, n.y));

        // Bleed off speed picked up from being thrown, back to a slow drift.
        n.vx += (Math.sign(n.vx) * 0.18 - n.vx) * 0.004;
        n.vy += (Math.sign(n.vy) * 0.18 - n.vy) * 0.004;

        const proximity = pointer.active
          ? Math.max(
              0,
              1 - Math.hypot(n.x - pointer.x, n.y - pointer.y) / queryRadius
            )
          : 0;
        n.heat += (proximity - n.heat) * 0.08;

        if (proximity > 0) {
          // Drift toward the query, the way retrieval pulls neighbours in.
          n.x += (pointer.x - n.x) * 0.0016 * proximity;
          n.y += (pointer.y - n.y) * 0.0016 * proximity;
        }
      }
      draw();
    };

    resize();
    seed();

    if (reduceMotion) {
      draw();
      const staticRo = new ResizeObserver(() => {
        fitToBounds();
        draw();
      });
      staticRo.observe(canvas);
      return () => staticRo.disconnect();
    }

    // Entrance: chunks pop in one after another.
    animate(nodes, {
      scale: 1,
      duration: 700,
      delay: stagger(26),
      ease: "outBack",
    });

    const timer = createTimer({ onUpdate: step });

    const toLocal = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onPointerMove = (e: PointerEvent) => {
      const p = toLocal(e);
      pointer.x = p.x;
      pointer.y = p.y;
      pointer.active = true;
      if (grabbed) {
        grabbed.vx = p.x - lastGrabPos.x;
        grabbed.vy = p.y - lastGrabPos.y;
        grabbed.x = p.x;
        grabbed.y = p.y;
        lastGrabPos = p;
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      // Never swallow a click meant for a link, button or form control.
      // The listener is on window, so the target is not guaranteed to be an
      // Element.
      const target = e.target;
      if (
        target instanceof Element &&
        target.closest("a, button, input, textarea, select")
      ) {
        return;
      }

      const p = toLocal(e);
      if (p.x < 0 || p.y < 0 || p.x > width || p.y > height) return;

      let nearest: Node | null = null;
      let best = GRAB_RADIUS;
      for (const n of nodes) {
        const d = Math.hypot(n.x - p.x, n.y - p.y);
        if (d < best) {
          best = d;
          nearest = n;
        }
      }
      if (noHover) {
        pointer.x = p.x;
        pointer.y = p.y;
        pointer.active = true;
        autoQuery = Math.atan2(p.y / height - 0.42, p.x / width - 0.5);
      }

      if (!nearest) return;

      grabbed = nearest;
      lastGrabPos = p;
      // Only now that a node is actually held: stops the drag turning into a
      // text selection over the article.
      e.preventDefault();
      document.body.style.cursor = "grabbing";
    };

    const onPointerUp = () => {
      if (!grabbed) return;
      // Cap the throw so the drift damping can absorb it.
      grabbed.vx = Math.max(-6, Math.min(6, grabbed.vx));
      grabbed.vy = Math.max(-6, Math.min(6, grabbed.vy));
      grabbed = null;
      document.body.style.cursor = "";
    };

    const onPointerLeave = () => {
      pointer.active = false;
      pointer.x = -9999;
      pointer.y = -9999;
    };

    // The canvas sits behind the article, so the window is what actually sees
    // the pointer. Listening here keeps the field reactive across the whole
    // page instead of only in the margins beside the text.
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    document.addEventListener("pointerleave", onPointerLeave);

    // Do not burn frames while scrolled away from the canvas.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) timer.play();
        else timer.pause();
      },
      { threshold: 0 }
    );
    io.observe(canvas);

    const ro = new ResizeObserver(fitToBounds);
    ro.observe(canvas);

    return () => {
      timer.pause();
      io.disconnect();
      ro.disconnect();
      document.body.style.cursor = "";
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      document.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [motion]);

  // Pointer handling lives on the window, so the canvas itself never needs to
  // receive events and must not sit in front of the article.
  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{ touchAction: "pan-y" }}
    />
  );
}
