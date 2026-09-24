"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Color, Scene, Fog, PerspectiveCamera, Vector3 } from "three";
import ThreeGlobe from "three-globe";
import { useFrame, useThree, Object3DNode, Canvas, extend } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import countries from "@/data/globe.json";
declare module "@react-three/fiber" {
  interface ThreeElements {
    threeGlobe: Object3DNode<ThreeGlobe, typeof ThreeGlobe>;
  }
}

extend({ ThreeGlobe });

const RING_PROPAGATION_SPEED = 3;
const aspect = 1.2;
const cameraZ = 300;

export type Position = {
  order: number;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  arcAlt: number;
  color: string;
};

export type GlobeConfig = {
  pointSize?: number;
  globeColor?: string;
  showAtmosphere?: boolean;
  atmosphereColor?: string;
  atmosphereAltitude?: number;
  emissive?: string;
  emissiveIntensity?: number;
  shininess?: number;
  polygonColor?: string;
  ambientLight?: string;
  directionalLeftLight?: string;
  directionalTopLight?: string;
  pointLight?: string;
  arcTime?: number;
  arcLength?: number;
  rings?: number;
  maxRings?: number;
  initialPosition?: {
    lat: number;
    lng: number;
  };
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  /** Swing back and forth between two longitudes instead of spinning. */
  sweep?: {
    fromLng: number;
    toLng: number;
    seconds: number;
  };
};

interface WorldProps {
  globeConfig: GlobeConfig;
  data: Position[];
}

// The parts of OrbitControls the sweep drives.
type SweepControls = {
  getAzimuthalAngle(): number;
  setAzimuthalAngle(angle: number): void;
  addEventListener(type: string, fn: () => void): void;
  removeEventListener(type: string, fn: () => void): void;
};

const shortest = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

type GlobePoint = {
  size: number;
  order: number;
  color: (t: number) => string;
  lat: number;
  lng: number;
};

let numbersOfRings = [0];

export function Globe({ globeConfig, data, still = false }: WorldProps & { still?: boolean }) {
  const [globeData, setGlobeData] = useState<GlobePoint[] | null>(null);

  const globeRef = useRef<ThreeGlobe | null>(null);
  const { camera } = useThree();

  const defaultProps = {
    pointSize: 1,
    atmosphereColor: "#ffffff",
    showAtmosphere: true,
    atmosphereAltitude: 0.1,
    polygonColor: "rgba(255,255,255,0.7)",
    globeColor: "#1d072e",
    emissive: "#000000",
    emissiveIntensity: 0.1,
    shininess: 0.9,
    arcTime: 2000,
    arcLength: 0.9,
    rings: 1,
    maxRings: 3,
    ...globeConfig,
  };

  useEffect(() => {
    if (globeRef.current) {
      _buildData();
      _buildMaterial();
      _aimCamera();
    }
    // Runs once the globe object exists; the data and config are static.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globeRef.current]);

  const _buildMaterial = () => {
    if (!globeRef.current) return;

    const globeMaterial = globeRef.current.globeMaterial() as unknown as {
      color: Color;
      emissive: Color;
      emissiveIntensity: number;
      shininess: number;
    };
    globeMaterial.color = new Color(globeConfig.globeColor);
    globeMaterial.emissive = new Color(globeConfig.emissive);
    globeMaterial.emissiveIntensity = globeConfig.emissiveIntensity || 0.1;
    globeMaterial.shininess = globeConfig.shininess || 0.9;
  };

  // initialPosition used to be declared but never applied, so the globe
  // always opened wherever the camera happened to sit. Put the camera over
  // the requested point instead.
  const _aimCamera = () => {
    const globe = globeRef.current;
    const at = globeConfig.initialPosition;
    if (!globe || !at) return;
    const { x, y, z } = globe.getCoords(at.lat, at.lng, 0);
    const dir = new Vector3(x, y, z).normalize();
    camera.position.copy(dir.multiplyScalar(cameraZ));
    camera.lookAt(0, 0, 0);
  };

  const _buildData = () => {
    const arcs = data;
    const points: GlobePoint[] = [];
    for (let i = 0; i < arcs.length; i++) {
      const arc = arcs[i];
      const rgb = hexToRgb(arc.color) as { r: number; g: number; b: number };
      points.push({
        size: defaultProps.pointSize,
        order: arc.order,
        color: (t: number) => `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${1 - t})`,
        lat: arc.startLat,
        lng: arc.startLng,
      });
      points.push({
        size: defaultProps.pointSize,
        order: arc.order,
        color: (t: number) => `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${1 - t})`,
        lat: arc.endLat,
        lng: arc.endLng,
      });
    }

    // remove duplicates for same lat and lng
    const filteredPoints = points.filter(
      (v, i, a) =>
        a.findIndex((v2) =>
          ["lat", "lng"].every(
            (k) => v2[k as "lat" | "lng"] === v[k as "lat" | "lng"]
          )
        ) === i
    );

    setGlobeData(filteredPoints);
  };

  useEffect(() => {
    if (globeRef.current && globeData) {
      globeRef.current
        .hexPolygonsData(countries.features)
        .hexPolygonResolution(3)
        .hexPolygonMargin(0.7)
        .showAtmosphere(defaultProps.showAtmosphere)
        .atmosphereColor(defaultProps.atmosphereColor)
        .atmosphereAltitude(defaultProps.atmosphereAltitude)
        .hexPolygonColor(() => defaultProps.polygonColor);
      startAnimation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globeData, still]);

  const startAnimation = () => {
    if (!globeRef.current || !globeData) return;

    globeRef.current
      .arcsData(data)
      .arcStartLat((d) => (d as { startLat: number }).startLat * 1)
      .arcStartLng((d) => (d as { startLng: number }).startLng * 1)
      .arcEndLat((d) => (d as { endLat: number }).endLat * 1)
      .arcEndLng((d) => (d as { endLng: number }).endLng * 1)
      .arcColor((e: object) => (e as { color: string }).color)
      .arcAltitude((e) => (e as { arcAlt: number }).arcAlt * 1)
      .arcStroke(() => [0.32, 0.28, 0.3][Math.round(Math.random() * 2)])
      // Still: the arcs are drawn whole rather than travelling.
      .arcDashLength(still ? 1 : defaultProps.arcLength)
      .arcDashInitialGap(still ? () => 0 : (e) => (e as { order: number }).order * 1)
      .arcDashGap(still ? 0 : 15)
      .arcDashAnimateTime(() => (still ? 0 : defaultProps.arcTime));

    // Points need lat/lng. They were being given the arcs, which have none,
    // so every point sat at NaN -- the "Computed radius is NaN" error the
    // original version logged on every load.
    globeRef.current
      .pointsData(globeData)
      .pointColor((e: object) => (e as GlobePoint).color(0))
      .pointsMerge(true)
      .pointAltitude(0.0)
      .pointRadius(2);

    globeRef.current
      .ringsData([])
      .ringColor((e: object) => (t: number) => (e as GlobePoint).color(t))
      .ringMaxRadius(defaultProps.maxRings)
      .ringPropagationSpeed(RING_PROPAGATION_SPEED)
      .ringRepeatPeriod(
        (defaultProps.arcTime * defaultProps.arcLength) / defaultProps.rings
      );
  };

  useEffect(() => {
    if (!globeRef.current || !globeData) return;
    if (still) {
      globeRef.current.ringsData([]);
      return;
    }

    const interval = setInterval(() => {
      if (!globeRef.current || !globeData) return;
      numbersOfRings = genRandomNumbers(
        0,
        globeData.length,
        Math.floor((globeData.length * 4) / 5)
      );

      globeRef.current.ringsData(
        globeData.filter((d, i) => numbersOfRings.includes(i))
      );
    }, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [globeData, still]);

  // Sweep: ease between the two longitudes, dwelling at each end. Starts at
  // the midpoint, and lets go while the visitor is dragging the globe.
  const sweep = still ? undefined : globeConfig.sweep;
  const controls = useThree((s) => s.controls) as unknown as SweepControls | null;
  const held = useRef(false);
  const clock = useRef(sweep ? sweep.seconds / 4 : 0);

  useEffect(() => {
    if (!controls) return;
    const grab = () => (held.current = true);
    const release = () => (held.current = false);
    controls.addEventListener("start", grab);
    controls.addEventListener("end", release);
    return () => {
      controls.removeEventListener("start", grab);
      controls.removeEventListener("end", release);
    };
  }, [controls]);

  useFrame((_, delta) => {
    const globe = globeRef.current;
    if (!sweep || !controls || !globe || held.current) return;
    const azimuth = (lng: number) => {
      const { x, z } = globe.getCoords(0, lng, 0);
      return Math.atan2(x, z);
    };
    clock.current += Math.min(delta, 0.1);
    const from = azimuth(sweep.fromLng);
    const span = shortest(azimuth(sweep.toLng) - from);
    const t = (1 - Math.cos((clock.current / sweep.seconds) * Math.PI * 2)) / 2;
    const now = controls.getAzimuthalAngle();
    const gap = shortest(from + span * t - now);
    controls.setAzimuthalAngle(now + gap * Math.min(1, delta * 3));
  });

  return (
    <>
      <threeGlobe ref={globeRef} />
    </>
  );
}

export function World({
  paused = false,
  still = false,
  ...props
}: WorldProps & {
  /** Stop rendering while scrolled out of view. */
  paused?: boolean;
  /** Reduced motion: draw once, no rotation. */
  still?: boolean;
}) {
  const { globeConfig } = props;
  // Created once rather than on every render.
  const scene = useMemo(() => {
    const s = new Scene();
    s.fog = new Fog(0xffffff, 400, 2000);
    return s;
  }, []);
  const camera = useMemo(() => new PerspectiveCamera(50, aspect, 180, 1800), []);
  // A still globe renders on demand, but the country outlines arrive a
  // moment after the first frame. Keep rendering briefly so the still frame
  // is the finished globe rather than an empty sphere.
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    setSettled(false);
    if (!still) return;
    const t = window.setTimeout(() => setSettled(true), 2500);
    return () => window.clearTimeout(t);
  }, [still]);

  return (
    <Canvas
      scene={scene}
      camera={camera}
      // Capped: an uncapped device pixel ratio renders three times the
      // pixels on many phones for no visible gain.
      dpr={[1, 2]}
      gl={{ alpha: true }}
      frameloop={paused ? "never" : still && settled ? "demand" : "always"}
    >
      <ambientLight color={globeConfig.ambientLight} intensity={0.6} />
      <directionalLight
        color={globeConfig.directionalLeftLight}
        position={new Vector3(-400, 100, 400)}
      />
      <directionalLight
        color={globeConfig.directionalTopLight}
        position={new Vector3(-200, 500, 200)}
      />
      <pointLight
        color={globeConfig.pointLight}
        position={new Vector3(-200, 500, 200)}
        intensity={0.8}
      />
      <Globe {...props} still={still} />
      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom={false}
        minDistance={cameraZ}
        maxDistance={cameraZ}
        autoRotate={!still && !globeConfig.sweep && (globeConfig.autoRotate ?? true)}
        autoRotateSpeed={globeConfig.autoRotateSpeed ?? 1}
        minPolarAngle={Math.PI / 3.5}
        maxPolarAngle={Math.PI - Math.PI / 3}
      />
    </Canvas>
  );
}

export function hexToRgb(hex: string) {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function (m, r, g, b) {
    return r + r + g + g + b + b;
  });

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function genRandomNumbers(min: number, max: number, count: number) {
  const arr: number[] = [];
  while (arr.length < count) {
    const r = Math.floor(Math.random() * (max - min)) + min;
    if (arr.indexOf(r) === -1) arr.push(r);
  }

  return arr;
}
