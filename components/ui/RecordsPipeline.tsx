"use client";

import { useEffect, useRef } from "react";
import { animate, createTimeline, createSpring, stagger, utils } from "animejs";

const INK = "#BEC1DD";
const ACCENT = "#CBACF9";
const PAPER = "#8E93B8";

const SHEETS = [0, 1, 2, 3, 4];
const ROWS = [0, 1, 2, 3, 4];

/** Where a filed row ends up. */
const rowY = (i: number) => 74 + i * 20;

/**
 * The project's story as a scene: paper records are carried over by hand,
 * handed to someone at a terminal, and come out the other side as aligned
 * rows in one system.
 *
 * Figures are flat pictograms on purpose. Anything closer to a real human
 * reads as a bad drawing rather than as a diagram.
 *
 * Decorative: hidden from assistive tech, and reduced motion gets the final
 * filed state with nothing moving.
 */
export default function RecordsPipeline({ className }: { className?: string }) {
  const rootRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const q = <T extends Element>(sel: string) =>
      Array.from(root.querySelectorAll<T>(sel));

    const carried = q<SVGGElement>("[data-carried]");
    const filed = q<SVGGElement>("[data-filed]");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Everything already delivered and filed.
      utils.set("#rp-walker", { x: 120, opacity: 0 });
      utils.set(carried, { opacity: 0 });
      utils.set(filed, { opacity: 1, x: 0, y: 0, rotate: 0 });
      return;
    }

    utils.set(filed, { opacity: 0 });

    // Legs swing in opposition; the free arm counter-swings with the back leg.
    const swing = (targets: string, from: number, to: number) =>
      animate(targets, {
        rotate: [from, to],
        duration: 380,
        ease: "inOutSine",
        loop: true,
        alternate: true,
        autoplay: false,
      });

    const gaitFront = swing("#rp-leg-a", -24, 24);
    const gaitBack = swing("#rp-leg-b, #rp-arm", 24, -24);
    const gait = {
      play: () => {
        gaitFront.play();
        gaitBack.play();
      },
      pause: () => {
        gaitFront.pause();
        gaitBack.pause();
      },
    };

    const bob = animate("#rp-walker-body", {
      y: [0, -2.5],
      duration: 190,
      ease: "inOutSine",
      loop: true,
      alternate: true,
      autoplay: false,
    });

    const tl = createTimeline({ loop: true, defaults: { ease: "outQuad" } });

    tl
      // Walk in carrying the stack.
      .call(() => {
        gait.play();
        bob.play();
      })
      .set("#rp-walker", { x: -170, opacity: 1 })
      .set(carried, { opacity: 1, y: 0 })
      .set("#rp-intray", { scaleY: 0 })
      .set(filed, { opacity: 0 })
      .add("#rp-walker", { x: 120, duration: 2600, ease: "linear" }, 0)

      // Stop at the desk and hand the stack over, sheet by sheet.
      .call(() => {
        gait.pause();
        bob.pause();
        utils.set("#rp-leg-a, #rp-leg-b, #rp-arm", { rotate: 0 });
        utils.set("#rp-walker-body", { y: 0 });
      })
      .add("#rp-handover", { opacity: [0, 1], duration: 200 })
      .add(
        carried,
        {
          x: 104,
          y: -10,
          opacity: [1, 0],
          duration: 420,
          delay: stagger(110),
        },
        "<<+=120"
      )
      .add("#rp-intray", { scaleY: [0, 1], duration: 700 }, "<<+=180")
      .add("#rp-handover", { opacity: 0, duration: 250 })

      // The courier leaves.
      .call(() => {
        gait.play();
        bob.play();
      })
      .add("#rp-walker", { x: -170, duration: 1700, ease: "linear" })
      .call(() => {
        gait.pause();
        bob.pause();
      })

      // The operator keys them in, and the system emits aligned rows.
      .add(
        "#rp-operator-arm",
        {
          rotate: [0, -13],
          duration: 150,
          loop: 11,
          alternate: true,
          ease: "inOutSine",
        },
        "<<-=1500"
      )
      .add("#rp-intray", { scaleY: 0, duration: 1500, ease: "inQuad" }, "<<")
      .add(
        filed,
        {
          opacity: [0, 1],
          x: [-132, 0],
          y: [-26, 0],
          rotate: [-9, 0],
          duration: 900,
          delay: stagger(150),
          ease: createSpring({ stiffness: 105, damping: 15 }),
        },
        "<<+=200"
      )

      // Hold the finished table, then clear it before running again.
      .add("#rp-scene", { opacity: [1, 1], duration: 1700 })
      .add(filed, { opacity: 0, duration: 450, delay: stagger(50) });

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) tl.play();
        else tl.pause();
      },
      { threshold: 0.15 }
    );
    io.observe(root);

    return () => {
      io.disconnect();
      tl.pause();
      gait.pause();
      bob.pause();
    };
  }, []);

  return (
    <svg
      ref={rootRef}
      aria-hidden="true"
      viewBox="0 0 720 190"
      className={className}
      fill="none"
    >
      <g id="rp-scene">
        {/* Floor */}
        <line x1="0" y1="178" x2="720" y2="178" stroke={INK} strokeOpacity="0.16" strokeWidth="1" />

        {/* ---- Courier carrying the paper records ---- */}
        <g id="rp-walker">
          <g id="rp-walker-body">
            <circle cx="150" cy="96" r="12" fill={INK} fillOpacity="0.9" />
            <path d="M150 109 L150 142" stroke={INK} strokeOpacity="0.9" strokeWidth="9" strokeLinecap="round" />
            <g id="rp-arm" style={{ transformOrigin: "150px 118px" }}>
              <path d="M150 118 L174 126" stroke={INK} strokeOpacity="0.9" strokeWidth="6" strokeLinecap="round" />
            </g>
            {/* Each sheet is wrapped in a group: animating x/y on a <rect>
                would write the SVG geometry attributes and flatten the stack,
                while a <g> has none and takes a transform instead. */}
            {SHEETS.map((i) => (
              <g key={i} data-carried>
                <rect
                  x="168"
                  y={122 - i * 6}
                  width="34"
                  height="5"
                  rx="1.5"
                  fill={PAPER}
                  fillOpacity={0.92}
                />
              </g>
            ))}
          </g>
          <g id="rp-leg-a" style={{ transformOrigin: "150px 142px" }}>
            <path d="M150 142 L150 172" stroke={INK} strokeOpacity="0.75" strokeWidth="8" strokeLinecap="round" />
          </g>
          <g id="rp-leg-b" style={{ transformOrigin: "150px 142px" }}>
            <path d="M150 142 L150 172" stroke={INK} strokeOpacity="0.45" strokeWidth="8" strokeLinecap="round" />
          </g>
        </g>

        {/* ---- In-tray the stack is handed into ---- */}
        <g id="rp-intray" style={{ transformOrigin: "268px 140px" }}>
          <rect x="246" y="122" width="44" height="18" rx="2" fill={PAPER} fillOpacity="0.9" />
        </g>
        <path d="M242 140 H294" stroke={INK} strokeOpacity="0.4" strokeWidth="3" strokeLinecap="round" />

        {/* Hand-off flash */}
        <circle id="rp-handover" cx="228" cy="126" r="20" fill={ACCENT} fillOpacity="0.16" opacity="0" />

        {/* ---- Operator, seated at the terminal, facing the output ---- */}
        <g id="rp-operator">
          {/* chair back */}
          <path d="M318 118 L318 150" stroke={INK} strokeOpacity="0.3" strokeWidth="5" strokeLinecap="round" />
          <circle cx="332" cy="92" r="12" fill={INK} fillOpacity="0.9" />
          {/* torso */}
          <path d="M332 105 L334 136" stroke={INK} strokeOpacity="0.9" strokeWidth="9" strokeLinecap="round" />
          {/* thigh then shin: this is what makes the figure read as seated */}
          <path d="M334 138 L368 140" stroke={INK} strokeOpacity="0.75" strokeWidth="8" strokeLinecap="round" />
          <path d="M368 140 L368 172" stroke={INK} strokeOpacity="0.75" strokeWidth="8" strokeLinecap="round" />
          <g id="rp-operator-arm" style={{ transformOrigin: "334px 112px" }}>
            <path d="M334 112 L372 128" stroke={INK} strokeOpacity="0.9" strokeWidth="6" strokeLinecap="round" />
          </g>
        </g>

        {/* ---- Desk and terminal ---- */}
        <rect x="356" y="130" width="104" height="5" rx="2" fill={INK} fillOpacity="0.55" />
        <path d="M456 135 L456 176" stroke={INK} strokeOpacity="0.35" strokeWidth="4" strokeLinecap="round" />
        <rect
          x="386"
          y="88"
          width="62"
          height="40"
          rx="4"
          stroke={ACCENT}
          strokeOpacity="0.6"
          strokeWidth="2.5"
          fill={ACCENT}
          fillOpacity="0.08"
        />
        <path
          d="M396 100 H430 M396 108 H438 M396 116 H420"
          stroke={ACCENT}
          strokeOpacity="0.55"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* ---- Filed rows out the other side ---- */}
        <g id="rp-output">
          {ROWS.map((i) => (
            <g key={i} data-filed>
              <rect x="492" y={rowY(i)} width="210" height="12" rx="2" fill={INK} fillOpacity="0.1" />
              <path d={`M492 ${rowY(i)} L492 ${rowY(i) + 12}`} stroke={ACCENT} strokeOpacity="0.55" strokeWidth="2.5" />
              <rect x="500" y={rowY(i) + 3.5} width="48" height="5" rx="1.5" fill={INK} fillOpacity="0.42" />
              <path d={`M560 ${rowY(i)} L560 ${rowY(i) + 12}`} stroke={ACCENT} strokeOpacity="0.3" strokeWidth="1.5" />
              <rect x="568" y={rowY(i) + 3.5} width="36" height="5" rx="1.5" fill={INK} fillOpacity="0.36" />
              <path d={`M616 ${rowY(i)} L616 ${rowY(i) + 12}`} stroke={ACCENT} strokeOpacity="0.3" strokeWidth="1.5" />
              <rect x="624" y={rowY(i) + 3.5} width="62" height="5" rx="1.5" fill={INK} fillOpacity="0.3" />
            </g>
          ))}
        </g>
      </g>
    </svg>
  );
}
