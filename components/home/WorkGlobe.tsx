"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

import type { GlobeConfig, Position } from "@/components/ui/Globe";
import { prefersReducedMotion, useMotionSetting } from "@/lib/motion";

// three.js and the country geometry are several hundred kB, so the globe is
// only fetched once the reader is near the bottom of the page.
const World = dynamic(() => import("@/components/ui/Globe").then((m) => m.World), {
  ssr: false,
});

const CITY = {
  honolulu: { lat: 21.3069, lng: -157.8583 },
  seattle: { lat: 47.6062, lng: -122.3321 },
  sanFrancisco: { lat: 37.7749, lng: -122.4194 },
  chicago: { lat: 41.8781, lng: -87.6298 },
  washington: { lat: 38.9072, lng: -77.0369 },
  newYork: { lat: 40.7128, lng: -74.006 },
  london: { lat: 51.5072, lng: -0.1276 },
  amsterdam: { lat: 52.3676, lng: 4.9041 },
  berlin: { lat: 52.52, lng: 13.405 },
  stockholm: { lat: 59.3293, lng: 18.0686 },
  budapest: { lat: 47.4979, lng: 19.0402 },
  madrid: { lat: 40.4168, lng: -3.7038 },
} as const;

const PURPLE = "#CBACF9";
const BLUE = "#93C5FD";
const PALE = "#E4ECFF";

const arc = (
  order: number,
  from: keyof typeof CITY,
  to: keyof typeof CITY,
  arcAlt: number,
  color: string
): Position => ({
  order,
  startLat: CITY[from].lat,
  startLng: CITY[from].lng,
  endLat: CITY[to].lat,
  endLng: CITY[to].lng,
  arcAlt,
  color,
});

/**
 * Honolulu to the US mainland, and across the Atlantic to Europe -- the
 * places this work can be done from. Stockholm, Budapest and Madrid are
 * there for the languages as much as the markets.
 */
const ARCS: Position[] = [
  arc(1, "honolulu", "sanFrancisco", 0.28, PURPLE),
  arc(1, "honolulu", "seattle", 0.3, BLUE),
  arc(2, "sanFrancisco", "chicago", 0.14, PALE),
  arc(2, "seattle", "newYork", 0.22, PURPLE),
  arc(3, "sanFrancisco", "washington", 0.22, BLUE),
  arc(3, "chicago", "newYork", 0.08, PALE),
  arc(4, "newYork", "london", 0.3, PURPLE),
  arc(4, "washington", "madrid", 0.3, BLUE),
  arc(5, "newYork", "stockholm", 0.38, PALE),
  arc(5, "london", "amsterdam", 0.06, PURPLE),
  arc(6, "amsterdam", "berlin", 0.07, BLUE),
  arc(6, "london", "madrid", 0.12, PALE),
  arc(7, "berlin", "budapest", 0.08, PURPLE),
  arc(7, "stockholm", "budapest", 0.14, BLUE),
  arc(8, "honolulu", "newYork", 0.5, PALE),
];

/** The original globe's look, kept as it was. */
const CONFIG: GlobeConfig = {
  pointSize: 4,
  globeColor: "#062056",
  showAtmosphere: true,
  atmosphereColor: "#FFFFFF",
  atmosphereAltitude: 0.1,
  emissive: "#062056",
  emissiveIntensity: 0.1,
  shininess: 0.9,
  polygonColor: "rgba(255,255,255,0.7)",
  ambientLight: "#38bdf8",
  directionalLeftLight: "#ffffff",
  directionalTopLight: "#ffffff",
  pointLight: "#ffffff",
  arcTime: 1000,
  arcLength: 0.9,
  rings: 1,
  maxRings: 3,
  // Open over the North Atlantic, then swing between the US and Europe
  // rather than spending half of every turn over Asia and the Pacific.
  initialPosition: { lat: 38, lng: -50 },
  sweep: { fromLng: -105, toLng: 5, seconds: 28 },
};

function canRunWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl2") || canvas.getContext("webgl"))
    );
  } catch {
    return false;
  }
}

export default function WorkGlobe() {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [capable, setCapable] = useState(true);
  const [still, setStill] = useState(false);
  // Drag-to-spin only where there is a mouse. On a touch screen the globe
  // spans the page width, and a canvas that captures touches would stop the
  // reader scrolling past it.
  const [draggable, setDraggable] = useState(false);
  const motion = useMotionSetting();

  useEffect(() => {
    setStill(prefersReducedMotion());
  }, [motion]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!canRunWebGL()) {
      setCapable(false);
      return;
    }
    setDraggable(window.matchMedia("(hover: hover) and (pointer: fine)").matches);

    // Load well before it arrives; render only while it is actually on
    // screen, so an off-screen globe costs no frames.
    const near = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setMounted(true);
          near.disconnect();
        }
      },
      { rootMargin: "600px 0px" }
    );
    const onScreen = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), {
      threshold: 0,
    });
    near.observe(el);
    onScreen.observe(el);
    return () => {
      near.disconnect();
      onScreen.disconnect();
    };
  }, []);

  return (
    <figure className="relative">
      <div
        ref={ref}
        aria-hidden="true"
        className={
          "relative mx-auto aspect-square w-full max-w-[26rem] [mask-image:radial-gradient(circle_at_center,black_58%,transparent_72%)]" +
          // The canvas wrapper sets pointer-events inline, hence the !important.
          (draggable ? "" : " pointer-events-none [&_*]:!pointer-events-none")
        }
      >
        {capable && mounted && (
          <World data={ARCS} globeConfig={CONFIG} paused={!visible} still={still} />
        )}
      </div>
      <figcaption className="mt-2 text-center text-sm text-white-200">
        Based in Honolulu. Authorized to work in the US and the EU.
      </figcaption>
    </figure>
  );
}
