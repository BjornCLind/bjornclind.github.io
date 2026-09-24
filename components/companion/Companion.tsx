"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { animate } from "animejs";

import PixelSprite from "./PixelSprite";
import { SPRITE_H, SPRITE_W, type FrameName } from "./sprite";

const STORAGE_KEY = "pixel-bjorn";
const GREETED_KEY = "pixel-bjorn-greeted";

/** One line per place, each said at most once per page view. */
const LINES: Record<string, string> = {
  hero: "Hi, I'm Bjorn! 👋",
  work: "Pick one. I built them all.",
  experience: "A lot of paper got retired here.",
  about: "Hej! Szia! ¡Hola!",
  education: "Always learning.",
  approach: "Measure twice, ship once.",
  contact: "Go on, say hi!",
  "policy-analyzer": "It reads policy so you don't have to.",
  "microfilm-digitization": "Decades of handwriting, now searchable.",
  "firearms-qualification-records": "Paper in, rows out.",
};

const WALK_SPEED = 0.16; // px per ms
const RUN_SPEED = 0.38;
const RUN_BEYOND = 320; // px from the target before he breaks into a run
const IDLE_WAVE_AFTER = 5000; // ms of a still pointer before he waves

const readPref = () => {
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== "off";
  } catch {
    return true;
  }
};
const writePref = (on: boolean) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, on ? "on" : "off");
  } catch {
    // Storage can be unavailable (private mode, blocked); the toggle still
    // works for this page view.
  }
};

function Walker({ scale, fine, still }: { scale: number; fine: boolean; still: boolean }) {
  const pathname = usePathname();
  // Read through a ref so navigating does not re-run the effect below, which
  // would reset him to his corner on every page change.
  const pathRef = useRef(pathname);
  const saidRef = useRef(new Set<string>());
  useEffect(() => {
    pathRef.current = pathname;
    saidRef.current.clear();
  }, [pathname]);

  const rootRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const hopRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const body = bodyRef.current;
    const hop = hopRef.current;
    const anchor = anchorRef.current;
    const bubble = bubbleRef.current;
    if (!root || !body || !hop || !anchor || !bubble) return;

    const w = SPRITE_W * scale;
    const h = SPRITE_H * scale;
    const margin = 16;

    const home = () => ({ x: window.innerWidth - w / 2 - margin, y: window.innerHeight - margin });
    const clamp = (x: number, y: number) => ({
      x: Math.min(window.innerWidth - w / 2 - 6, Math.max(w / 2 + 6, x)),
      y: Math.min(window.innerHeight - 6, Math.max(h + 70, y)),
    });

    const start = home();
    const s = {
      x: start.x,
      y: start.y,
      tx: start.x,
      ty: start.y,
      facing: -1,
      step: 0,
      walking: false,
      waving: false,
      raf: 0,
      last: 0,
      frameClock: 0,
    };
    const timers = new Set<number>();
    const later = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        timers.delete(id);
        fn();
      }, ms);
      timers.add(id);
      return id;
    };

    // ---- Rendering -------------------------------------------------------
    const frames = Array.from(root.querySelectorAll<SVGGElement>("[data-frame]"));
    let shown: FrameName = "idle";
    const setFrame = (name: FrameName) => {
      if (name === shown) return;
      frames.forEach((g) => (g.style.display = g.dataset.frame === name ? "" : "none"));
      shown = name;
    };
    const place = () => {
      root.style.transform = `translate3d(${s.x - w / 2}px, ${s.y - h}px, 0)`;
      const bob = s.walking && s.step === 1 ? -scale : 0;
      body.style.transform = `translateY(${bob}px) scaleX(${s.facing})`;
      // Keep the speech bubble on screen near either edge. This is on the
      // anchor, so the bubble's own scale animation cannot overwrite it.
      anchor.dataset.edge =
        s.x < 120 ? "left" : s.x > window.innerWidth - 120 ? "right" : "centre";
    };

    // ---- Speech ----------------------------------------------------------
    let bubbleHide = 0;
    const say = (key: string) => {
      const line = LINES[key];
      if (!line || saidRef.current.has(key)) return;
      saidRef.current.add(key);
      bubble.textContent = line;
      animate(bubble, { opacity: [0, 1], scale: [0.7, 1], duration: 320, ease: "outBack" });
      window.clearTimeout(bubbleHide);
      // The exit runs on a timer as well as an animation, so a throttled tab
      // still clears the bubble.
      bubbleHide = later(() => {
        animate(bubble, { opacity: 0, scale: 0.85, duration: 260, ease: "inQuad" });
        later(() => (bubble.style.opacity = "0"), 400);
      }, 2800);
    };

    const placeKey = () => {
      const path = pathRef.current;
      if (path.startsWith("/projects/")) return path.split("/")[2] ?? "";
      const under = document.elementFromPoint(s.x, s.y - h * 0.6);
      return under?.closest("section[id]")?.id ?? "hero";
    };

    // ---- Wave ------------------------------------------------------------
    const wave = (key?: string) => {
      if (s.waving || s.walking) return;
      s.waving = true;
      let n = 0;
      const tick = () => {
        // Moving cancels a wave rather than fighting the walk cycle.
        if (s.walking || !s.waving) {
          s.waving = false;
          return;
        }
        setFrame(n % 2 === 0 ? "waveA" : "waveB");
        if (++n < 7) later(tick, 170);
        else {
          s.waving = false;
          setFrame("idle");
        }
      };
      tick();
      if (key) say(key);
    };

    place();
    root.style.opacity = "1";

    if (still) {
      // Reduced motion: he stands in his corner, and nothing about him moves.
      return () => timers.forEach((t) => window.clearTimeout(t));
    }

    // ---- Blink -----------------------------------------------------------
    const blink = () => {
      if (!s.walking && !s.waving) {
        setFrame("blink");
        later(() => {
          if (!s.walking && !s.waving) setFrame("idle");
        }, 130);
      }
      later(blink, 2600 + Math.random() * 2600);
    };
    later(blink, 2000);

    // ---- Movement --------------------------------------------------------
    let onArrive: (() => void) | null = null;
    const frame = (t: number) => {
      const dt = s.last ? Math.min(48, t - s.last) : 16;
      s.last = t;
      const dx = s.tx - s.x;
      const dy = s.ty - s.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 2.5) {
        const running = dist > RUN_BEYOND;
        const stride = Math.min(dist, (running ? RUN_SPEED : WALK_SPEED) * dt);
        s.x += (dx / dist) * stride;
        s.y += (dy / dist) * stride;
        if (Math.abs(dx) > 1) s.facing = dx > 0 ? 1 : -1;
        s.walking = true;
        s.frameClock += dt;
        if (s.frameClock > (running ? 90 : 150)) {
          s.frameClock = 0;
          s.step = s.step ? 0 : 1;
        }
        setFrame(s.step ? "walkB" : "walkA");
        place();
        s.raf = requestAnimationFrame(frame);
        return;
      }

      s.walking = false;
      s.step = 0;
      s.last = 0;
      s.raf = 0;
      if (!s.waving) setFrame("idle");
      place();
      const done = onArrive;
      onArrive = null;
      done?.();
    };
    const go = (x: number, y: number, then?: () => void) => {
      const p = clamp(x, y);
      s.tx = p.x;
      s.ty = p.y;
      onArrive = then ?? null;
      if (!s.raf) s.raf = requestAnimationFrame(frame);
    };

    // Say hello once per visit.
    let greeted = false;
    try {
      greeted = window.sessionStorage.getItem(GREETED_KEY) === "1";
      window.sessionStorage.setItem(GREETED_KEY, "1");
    } catch {
      // Without session storage he simply greets on each page load.
    }
    if (!greeted) later(() => wave("hero"), 1200);
    else saidRef.current.add("hero");

    const cleanups: Array<() => void> = [];

    if (fine) {
      // Mouse: trail the pointer, stand beside it, and face it once settled.
      let idleTimer = 0;
      let px = s.x;
      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        px = e.clientX;
        const side = e.clientX < s.x ? 1 : -1;
        go(e.clientX + side * (w * 0.75 + 10), e.clientY + h * 0.55, () => {
          s.facing = px > s.x ? 1 : -1;
          place();
        });
        window.clearTimeout(idleTimer);
        idleTimer = later(() => wave(placeKey()), IDLE_WAVE_AFTER);
      };
      const onClick = () =>
        animate(hop, { y: [0, -scale * 6, 0], duration: 440, ease: "outQuad" });
      window.addEventListener("pointermove", onMove);
      window.addEventListener("click", onClick);
      cleanups.push(() => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("click", onClick);
      });
    } else {
      // Touch: no pointer to follow, so he walks to where you tap, says
      // something about that part of the page, then heads back to his corner.
      let goHome = 0;
      const onTap = (e: MouseEvent) => {
        window.clearTimeout(goHome);
        go(e.clientX, e.clientY + h * 0.4, () => {
          wave(placeKey());
          goHome = later(() => {
            const p = home();
            go(p.x, p.y, () => {
              s.facing = -1;
              place();
            });
          }, 4200);
        });
      };
      window.addEventListener("click", onTap);
      cleanups.push(() => window.removeEventListener("click", onTap));
    }

    const onResize = () => {
      const p = clamp(s.x, s.y);
      s.x = p.x;
      s.y = p.y;
      const t = clamp(s.tx, s.ty);
      s.tx = t.x;
      s.ty = t.y;
      place();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cleanups.forEach((fn) => fn());
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(s.raf);
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [scale, fine, still]);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="companion-walker pointer-events-none fixed left-0 top-0 z-30 select-none will-change-transform"
      // Parked off screen until the effect has placed him.
      style={{
        width: SPRITE_W * scale,
        height: SPRITE_H * scale,
        opacity: 0,
        transform: "translate3d(-999px,-999px,0)",
      }}
    >
      <div ref={anchorRef} className="companion-anchor" data-edge="centre">
        <div
          ref={bubbleRef}
          className="whitespace-nowrap rounded-lg border border-white/15 bg-black-100/95 px-3 py-1.5 text-xs text-white shadow-lg"
          style={{ opacity: 0 }}
        />
      </div>
      <div ref={hopRef} className="h-full w-full">
        <div ref={bodyRef} className="h-full w-full origin-bottom">
          <PixelSprite scale={scale} />
        </div>
      </div>
    </div>
  );
}

/**
 * A pixel version of Bjorn that follows the reader around the site.
 *
 * It never takes pointer events, so it cannot block a click, and it can be
 * switched off -- a companion that follows the cursor is charming until it is
 * not, and that call belongs to the visitor. The choice is remembered.
 */
export default function Companion() {
  const [ready, setReady] = useState(false);
  const [on, setOn] = useState(true);
  const [env, setEnv] = useState({ scale: 3, fine: true, still: false });

  useEffect(() => {
    setOn(readPref());
    setEnv({
      scale: window.innerWidth < 640 ? 2.5 : 3,
      fine: window.matchMedia("(hover: hover) and (pointer: fine)").matches,
      still: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    });
    setReady(true);
  }, []);

  if (!ready) return null;

  const toggle = () => {
    setOn((v) => {
      writePref(!v);
      return !v;
    });
  };

  return (
    <>
      {on && <Walker {...env} />}
      <button
        type="button"
        onClick={toggle}
        aria-pressed={on}
        aria-label={on ? "Hide pixel Bjorn" : "Show pixel Bjorn"}
        title={on ? "Hide pixel Bjorn" : "Show pixel Bjorn"}
        className="fixed bottom-4 left-4 z-40 flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-black-100/80 backdrop-blur transition hover:border-white/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple"
        style={{ opacity: on ? 1 : 0.55 }}
      >
        <PixelSprite scale={1.6} crop={{ x: 2, y: 0, w: 12, h: 13 }} />
      </button>
    </>
  );
}
