import { FRAMES, PALETTE, SPRITE_H, SPRITE_W, type FrameName } from "./sprite";

/**
 * One path per colour per frame: a few dozen elements for the whole sheet
 * rather than one per pixel. Built once at module load.
 */
const PATHS: Record<FrameName, Array<{ fill: string; d: string }>> = Object.fromEntries(
  (Object.keys(FRAMES) as FrameName[]).map((name) => {
    const byColour = new Map<string, string[]>();
    FRAMES[name].forEach((row, y) => {
      Array.from(row).forEach((key, x) => {
        if (key === ".") return;
        const list = byColour.get(key) ?? [];
        list.push(`M${x} ${y}h1v1h-1z`);
        byColour.set(key, list);
      });
    });
    return [
      name,
      Array.from(byColour, ([key, cells]) => ({ fill: PALETTE[key], d: cells.join("") })),
    ];
  })
) as Record<FrameName, Array<{ fill: string; d: string }>>;

/**
 * Every frame is rendered once and all but the current one hidden, so
 * switching frames is a style change rather than a re-render.
 */
export default function PixelSprite({
  frame = "idle",
  scale = 3,
  crop,
  className,
}: {
  frame?: FrameName;
  scale?: number;
  /** Show only part of the sprite, in sprite pixels -- e.g. just the head. */
  crop?: { x: number; y: number; w: number; h: number };
  className?: string;
}) {
  const box = crop ?? { x: 0, y: 0, w: SPRITE_W, h: SPRITE_H };
  return (
    <svg
      viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`}
      width={box.w * scale}
      height={box.h * scale}
      shapeRendering="crispEdges"
      className={className}
      aria-hidden="true"
    >
      {(Object.keys(PATHS) as FrameName[]).map((name) => (
        <g key={name} data-frame={name} style={{ display: name === frame ? undefined : "none" }}>
          {PATHS[name].map((p) => (
            <path key={p.fill} d={p.d} fill={p.fill} />
          ))}
        </g>
      ))}
    </svg>
  );
}
