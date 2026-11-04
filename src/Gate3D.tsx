// GATE TEST: procedural three.js scene (no external assets) — a little farm
// with falling meat chunks and a slow dolly camera. If this frame comes back
// from GitHub Actions with real 3D shading (not a flat/blank background),
// the Ricks-style 3D pipeline is viable on Actions' machines.
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

export const Gate3D = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const camX = Math.sin(frame * 0.012) * 1.4;
  const camZ = 10.5 - frame * 0.022;
  return (
    <AbsoluteFill style={{ backgroundColor: "#87b5d9" }}>
      <ThreeCanvas
        linear
        width={width}
        height={height}
        camera={{ fov: 55, position: [camX, 3.4, camZ] }}
      >
        <ambientLight intensity={0.75} />
        <directionalLight position={[6, 12, 7]} intensity={1.7} />
        {/* ground */}
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[46, 46]} />
          <meshStandardMaterial color="#7a9a44" />
        </mesh>
        {/* farmhouse: box body + cone roof */}
        <mesh position={[-2.0, 1.05, -2.2]}>
          <boxGeometry args={[3.2, 2.1, 2.6]} />
          <meshStandardMaterial color="#9a7a56" />
        </mesh>
        <mesh position={[-2.0, 2.85, -2.2]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[2.6, 1.5, 4]} />
          <meshStandardMaterial color="#5d4630" />
        </mesh>
        {/* door */}
        <mesh position={[-2.0, 0.75, -0.88]}>
          <boxGeometry args={[0.8, 1.5, 0.06]} />
          <meshStandardMaterial color="#4c3826" />
        </mesh>
        {/* tree */}
        <mesh position={[2.8, 0.9, -1.6]}>
          <cylinderGeometry args={[0.18, 0.28, 1.8, 8]} />
          <meshStandardMaterial color="#5d4630" />
        </mesh>
        <mesh position={[2.8, 2.7, -1.6]}>
          <sphereGeometry args={[1.35, 20, 16]} />
          <meshStandardMaterial color="#5f7a3d" />
        </mesh>
        {/* fence posts */}
        {[-3.4, -1.7, 0, 1.7, 3.4].map((x) => (
          <mesh key={x} position={[x + 1.2, 0.45, 0.8]}>
            <boxGeometry args={[0.14, 0.9, 0.14]} />
            <meshStandardMaterial color="#6e563e" />
          </mesh>
        ))}
        {/* falling meat chunks */}
        {Array.from({ length: 14 }).map((_, i) => {
          const x = -4.2 + ((i * 0.67) % 8.4);
          const y = 7.2 - ((frame * (0.055 + (i % 5) * 0.013) + i * 0.93) % 6.6);
          return (
            <mesh
              key={i}
              position={[x, Math.max(0.35, y), -1.2 - (i % 4) * 0.5]}
              rotation={[frame * 0.021 + i, i * 1.3, frame * 0.013]}
            >
              <dodecahedronGeometry args={[0.24 + (i % 3) * 0.08]} />
              <meshStandardMaterial color="#b23a2f" />
            </mesh>
          );
        })}
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
