"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { Group, Mesh, MeshStandardMaterial } from "three";

const SKIN = "#C9CCE4";
const JOINT = "#9BA0C4";
const ACCENT = "#CBACF9";
const DESK = "#1B1F3A";

/** Length of one full check-in cycle, in seconds. */
const CYCLE = 13;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
/** 0 before `a`, 1 after `b`, smoothly eased between. */
const ramp = (t: number, a: number, b: number) => {
  const x = clamp01((t - a) / (b - a));
  return x * x * (3 - 2 * x);
};
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** A tapered limb segment with a ball joint at its top. */
function Bone({
  length,
  radius,
  joint = true,
}: {
  length: number;
  radius: number;
  joint?: boolean;
}) {
  return (
    <group>
      {joint && (
        <mesh castShadow>
          <sphereGeometry args={[radius * 1.25, 20, 16]} />
          <meshStandardMaterial color={JOINT} roughness={0.55} metalness={0.05} />
        </mesh>
      )}
      <mesh position={[0, -length / 2, 0]} castShadow>
        <capsuleGeometry args={[radius, length * 0.72, 6, 16]} />
        <meshStandardMaterial color={SKIN} roughness={0.62} metalness={0.04} />
      </mesh>
    </group>
  );
}

function Mannequin({
  rightArm,
  rightForearm,
  body,
}: {
  rightArm: React.RefObject<Group>;
  rightForearm: React.RefObject<Group>;
  body: React.RefObject<Group>;
}) {
  return (
    <group ref={body} position={[0.62, 0, 0.2]}>
      {/* Head and neck */}
      <mesh position={[0, 1.63, 0]} castShadow>
        <sphereGeometry args={[0.115, 28, 24]} />
        <meshStandardMaterial color={SKIN} roughness={0.6} metalness={0.04} />
      </mesh>
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.042, 0.05, 0.09, 16]} />
        <meshStandardMaterial color={JOINT} roughness={0.55} />
      </mesh>

      {/* Chest and pelvis, split at the waist ball like a real mannequin */}
      <mesh position={[0, 1.31, 0]} castShadow>
        <capsuleGeometry args={[0.155, 0.2, 6, 20]} />
        <meshStandardMaterial color={SKIN} roughness={0.62} metalness={0.04} />
      </mesh>
      <mesh position={[0, 1.11, 0]} castShadow>
        <sphereGeometry args={[0.078, 20, 16]} />
        <meshStandardMaterial color={JOINT} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.98, 0]} castShadow>
        <capsuleGeometry args={[0.135, 0.1, 6, 20]} />
        <meshStandardMaterial color={SKIN} roughness={0.62} metalness={0.04} />
      </mesh>

      {/* Left arm, resting */}
      <group position={[-0.2, 1.4, 0]} rotation={[0, 0, 0.12]}>
        <Bone length={0.3} radius={0.052} />
        <group position={[0, -0.3, 0]} rotation={[0.18, 0, 0]}>
          <Bone length={0.28} radius={0.045} />
          <mesh position={[0, -0.3, 0]} castShadow>
            <sphereGeometry args={[0.05, 16, 14]} />
            <meshStandardMaterial color={JOINT} roughness={0.55} />
          </mesh>
        </group>
      </group>

      {/* Right arm, the one that presents the case */}
      <group ref={rightArm} position={[0.2, 1.4, 0]}>
        <Bone length={0.3} radius={0.052} />
        <group ref={rightForearm} position={[0, -0.3, 0]}>
          <Bone length={0.28} radius={0.045} />
          <mesh position={[0, -0.3, 0]} castShadow>
            <sphereGeometry args={[0.05, 16, 14]} />
            <meshStandardMaterial color={JOINT} roughness={0.55} />
          </mesh>
        </group>
      </group>

      {/* Legs */}
      {[-0.095, 0.095].map((x) => (
        <group key={x} position={[x, 0.9, 0]}>
          <Bone length={0.44} radius={0.062} />
          <group position={[0, -0.44, 0]}>
            <Bone length={0.42} radius={0.05} />
            <mesh position={[0, -0.45, 0.04]} castShadow>
              <boxGeometry args={[0.1, 0.05, 0.2]} />
              <meshStandardMaterial color={JOINT} roughness={0.6} />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  );
}

function Counter({
  scanner,
  screen,
}: {
  scanner: React.RefObject<MeshStandardMaterial>;
  screen: React.RefObject<MeshStandardMaterial>;
}) {
  return (
    <group position={[0, 0, -0.78]}>
      {/* Counter top and front panel */}
      <mesh position={[0, 0.86, 0]} receiveShadow castShadow>
        <boxGeometry args={[1.9, 0.07, 0.62]} />
        <meshStandardMaterial color={DESK} roughness={0.5} metalness={0.15} />
      </mesh>
      <mesh position={[0, 0.42, -0.14]}>
        <boxGeometry args={[1.86, 0.82, 0.32]} />
        <meshStandardMaterial color="#12162C" roughness={0.75} />
      </mesh>

      {/* Scanner pad the case is set on */}
      <mesh position={[0.02, 0.9, 0.16]} receiveShadow>
        <boxGeometry args={[0.44, 0.02, 0.3]} />
        <meshStandardMaterial
          ref={scanner}
          color="#221a3d"
          emissive={ACCENT}
          emissiveIntensity={0.25}
          roughness={0.4}
        />
      </mesh>

      {/* Terminal */}
      <mesh position={[-0.52, 1.02, -0.1]} rotation={[0, 0.34, 0]} castShadow>
        <boxGeometry args={[0.52, 0.34, 0.03]} />
        <meshStandardMaterial color="#0E1226" roughness={0.45} metalness={0.2} />
      </mesh>
      <mesh position={[-0.512, 1.02, -0.085]} rotation={[0, 0.34, 0]}>
        <planeGeometry args={[0.46, 0.28]} />
        <meshStandardMaterial
          ref={screen}
          color="#0a0d1e"
          emissive={ACCENT}
          emissiveIntensity={0.22}
          roughness={0.3}
        />
      </mesh>
      <mesh position={[-0.52, 0.9, 0.06]} rotation={[0, 0.34, 0]}>
        <boxGeometry args={[0.4, 0.02, 0.16]} />
        <meshStandardMaterial color="#161A31" roughness={0.6} />
      </mesh>
    </group>
  );
}

/** Rows that print out of the terminal once the case is registered. */
function Records({ rows }: { rows: React.RefObject<Group> }) {
  const bars = useMemo(() => [0, 1, 2, 3, 4], []);
  return (
    <group ref={rows} position={[-0.58, 1.34, -0.9]} rotation={[0, 0.34, 0]}>
      {bars.map((i) => (
        <group key={i} position={[0, i * 0.075, 0]} scale={[0, 1, 1]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.5, 0.045, 0.012]} />
            <meshStandardMaterial
              color="#1a1f3d"
              emissive={ACCENT}
              emissiveIntensity={0.35}
              roughness={0.4}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Scene() {
  const body = useRef<Group>(null);
  const rightArm = useRef<Group>(null);
  const rightForearm = useRef<Group>(null);
  const caseRef = useRef<Group>(null);
  const rows = useRef<Group>(null);
  const scanner = useRef<MeshStandardMaterial>(null);
  const screen = useRef<MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() % CYCLE;

    // Idle breathing throughout.
    if (body.current) {
      body.current.position.y = Math.sin(clock.getElapsedTime() * 1.1) * 0.006;
      // Turned towards the counter on its left.
      body.current.rotation.y = -0.42 + Math.sin(clock.getElapsedTime() * 0.5) * 0.02;
    }

    // 1.5-3.5s: raise the case onto the scanner. 8.5-10s: take it back.
    const present = ramp(t, 1.5, 3.5) - ramp(t, 9.2, 10.6);

    if (rightArm.current) {
      rightArm.current.rotation.x = mix(0.05, -1.15, present);
      rightArm.current.rotation.z = mix(-0.08, -0.12, present);
    }
    if (rightForearm.current) {
      rightForearm.current.rotation.x = mix(0.2, -0.5, present);
    }
    if (caseRef.current) {
      // From the hand down onto the pad.
      caseRef.current.position.set(
        mix(0.86, 0.04, present),
        mix(0.92, 0.95, present),
        mix(0.3, -0.62, present)
      );
      caseRef.current.rotation.y = mix(-0.4, 0.02, present);
    }

    // Scanner reads it while the case is down.
    const reading = ramp(t, 3.6, 4.1) - ramp(t, 8.6, 9.1);
    if (scanner.current) {
      scanner.current.emissiveIntensity =
        0.25 + reading * (0.9 + Math.sin(t * 22) * 0.45);
    }
    if (screen.current) {
      screen.current.emissiveIntensity = 0.22 + ramp(t, 4.2, 5) * 0.5;
    }

    // Rows print one after another, then clear before the cycle repeats.
    if (rows.current) {
      rows.current.children.forEach((child, i) => {
        const inAt = 4.6 + i * 0.45;
        const grow = ramp(t, inAt, inAt + 0.5) - ramp(t, 11.2 + i * 0.12, 11.9 + i * 0.12);
        child.scale.x = grow;
        (child as Group).position.z = mix(0.05, 0, grow);
      });
    }
  });

  return (
    <>
      <color attach="background" args={["#000319"]} />
      <fog attach="fog" args={["#000319", 4.5, 11]} />

      <ambientLight intensity={0.72} />
      <directionalLight
        position={[3.5, 5, 3]}
        intensity={1.5}
        color="#eef0ff"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-1.8, 1.6, 1.4]} intensity={9} color={ACCENT} distance={7} />
      <pointLight position={[2.4, 1.2, 1.6]} intensity={4} color="#7aa2ff" distance={7} />
      {/* Fill on the counter, which otherwise sits in the figure's shadow. */}
      <pointLight position={[-0.4, 1.9, 0.6]} intensity={5} color="#dfe4ff" distance={5} />

      <Mannequin body={body} rightArm={rightArm} rightForearm={rightForearm} />
      <Counter scanner={scanner} screen={screen} />
      <Records rows={rows} />

      {/* The firearm, cased for transport as it would be at a counter. */}
      <group ref={caseRef}>
        <mesh castShadow>
          <boxGeometry args={[0.34, 0.075, 0.22]} />
          <meshStandardMaterial color="#232845" roughness={0.55} metalness={0.25} />
        </mesh>
        <mesh position={[0, 0.042, 0]}>
          <boxGeometry args={[0.28, 0.008, 0.16]} />
          <meshStandardMaterial
            color="#2d3357"
            emissive={ACCENT}
            emissiveIntensity={0.35}
            roughness={0.4}
          />
        </mesh>
      </group>

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[26, 26]} />
        <meshStandardMaterial color="#05081c" roughness={0.9} metalness={0.1} />
      </mesh>

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate
        autoRotateSpeed={0.5}
        minPolarAngle={Math.PI / 3.4}
        maxPolarAngle={Math.PI / 2.05}
        target={[-0.05, 1.05, -0.45]}
      />
    </>
  );
}

export default function CheckInScene() {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ position: [2.5, 2.05, 4.2], fov: 34 }}
      style={{ width: "100%", height: "100%" }}
    >
      <Scene />
    </Canvas>
  );
}
