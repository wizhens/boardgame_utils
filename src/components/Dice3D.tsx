import { useMemo, type CSSProperties } from "react";

type Dice3DProps = {
  value: 1 | 2 | 3 | 4 | 5 | 6;
  size?: number; // px
  spinX?: number; // additional full rotations
  spinY?: number; // additional full rotations
  durationMs?: number;
};

// 各面の番号割り当て
// front:1, back:6, right:3, left:4, top:5, bottom:2
const VALUE_TO_BASE_ROTATION: Record<
  1 | 2 | 3 | 4 | 5 | 6,
  { x: number; y: number }
> = {
  1: { x: 0, y: 0 },
  6: { x: 0, y: 180 },
  3: { x: 0, y: -90 },
  4: { x: 0, y: 90 },
  5: { x: -90, y: 0 },
  2: { x: 90, y: 0 },
};

const pipPositions: Record<1 | 2 | 3 | 4 | 5 | 6, Array<[number, number]>> = {
  1: [[50, 50]],
  2: [
    [27, 27],
    [73, 73],
  ],
  3: [
    [25, 25],
    [50, 50],
    [75, 75],
  ],
  4: [
    [27, 27],
    [73, 27],
    [27, 73],
    [73, 73],
  ],
  5: [
    [25, 25],
    [75, 25],
    [50, 50],
    [25, 75],
    [75, 75],
  ],
  6: [
    [27, 22],
    [73, 22],
    [27, 50],
    [73, 50],
    [27, 78],
    [73, 78],
  ],
};

export function Dice3D({
  value,
  size = 56,
  spinX = 0,
  spinY = 0,
  durationMs = 900,
}: Dice3DProps) {
  const half = size / 2;

  const rotation = useMemo(() => {
    const base = VALUE_TO_BASE_ROTATION[value];
    const x = base.x + 360 * spinX;
    const y = base.y + 360 * spinY;
    return `rotateX(${x}deg) rotateY(${y}deg)`;
  }, [value, spinX, spinY]);

  const cubeStyle: CSSProperties = {
    width: size,
    height: size,
    transformStyle: "preserve-3d",
    transform: rotation,
    transition: `transform ${durationMs}ms cubic-bezier(0.2, 0.8, 0.2, 1)`,
  };

  const faceStyle: CSSProperties = {
    position: "absolute",
    width: size,
    height: size,
    background: "white",
    borderRadius: size * 0.12,
    boxShadow: "inset 0 0 0 2px rgba(0,0,0,0.08)",
    display: "grid",
    placeItems: "center",
  };

  const pipStyle: CSSProperties = {
    position: "absolute",
    width: size * 0.18,
    height: size * 0.18,
    borderRadius: "9999px",
    background: "#111827",
    boxShadow: "0 1px 0 rgba(0,0,0,0.2)",
  };

  const face = (num: 1 | 2 | 3 | 4 | 5 | 6, transform: string) => (
    <div style={{ ...faceStyle, transform }}>
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        {pipPositions[num].map(([x, y], i) => (
          <div
            key={i}
            style={{
              ...pipStyle,
              left: `calc(${x}% - ${(pipStyle.width! as number) / 2}px)`,
              top: `calc(${y}% - ${(pipStyle.height! as number) / 2}px)`,
            }}
          />
        ))}
      </div>
    </div>
  );

  const containerStyle: CSSProperties = {
    perspective: size * 6,
  };

  return (
    <div style={containerStyle} className="inline-block">
      <div style={cubeStyle}>
        {face(1, `translateZ(${half}px)`)}
        {face(6, `rotateY(180deg) translateZ(${half}px)`)}
        {face(3, `rotateY(90deg) translateZ(${half}px)`)}
        {face(4, `rotateY(-90deg) translateZ(${half}px)`)}
        {face(5, `rotateX(90deg) translateZ(${half}px)`)}
        {face(2, `rotateX(-90deg) translateZ(${half}px)`)}
      </div>
    </div>
  );
}

export default Dice3D;
