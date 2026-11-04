// Meat Shower — 3D PROOF (frames 0-329, lines 1-3 of the locked timeline).
// Real three.js: farm set with porch, Mrs. Crouch character (big white head,
// dress + apron), kettle, meat rain, hard-cut camera scenes with real 3D moves.
// Captions are the same 2-word overlay as the 2D build, drawn over the canvas.
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { useThree } from "@react-three/fiber";
import timeline from "./timeline.json";

// ---------- timeline helpers ----------
interface W { word: string; start: number; end: number }
interface L { start: number; end: number; words: W[] }
const LINES = (timeline as { lines: L[] }).lines;
const FLAT: { word: string; line: number; start: number; end: number }[] = [];
LINES.forEach((l, li) => l.words.forEach((w) => FLAT.push({ word: w.word, line: li + 1, start: w.start, end: w.end })));
const RED = new Set(["1:meat"]);
const WF = (li: number, wi: number) => Math.round(LINES[li].words[wi].start * 30);

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const smooth = (u: number) => { u = clamp01(u); return u * u * (3 - 2 * u); };
const rng = (seed: number) => { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; };

// ---------- 3D pieces ----------
function Chunk({ p, s = 0.26, rot = [0, 0, 0] as const, squash = 1 }: { p: [number, number, number]; s?: number; rot?: readonly [number, number, number]; squash?: number }) {
  return (
    <mesh position={p} rotation={[rot[0], rot[1], rot[2]]} scale={[1, squash, 1]} castShadow>
      <dodecahedronGeometry args={[s]} />
      <meshStandardMaterial color="#b23a2f" flatShading roughness={0.65} />
    </mesh>
  );
}

// Looping-but-accumulating meat rain for one scene window.
function Rain({ start, count, seed, area }: { start: number; count: number; seed: number; area: [number, number, number, number] }) {
  const frame = useCurrentFrame();
  const r = rng(seed);
  const chunks = Array.from({ length: count }).map((_, i) => ({
    x: area[0] + r() * (area[1] - area[0]),
    z: area[2] + r() * (area[3] - area[2]),
    delay: start + i * 2.5 + r() * 8,
    cycle: 40 + (i % 5) * 5,
    s: 0.16 + r() * 0.16,
    spin: 0.02 + r() * 0.03,
    ph: r() * 6.3,
  }));
  return (
    <group>
      {chunks.map((c, i) => {
        const local = frame - c.delay;
        if (local < 0) return null;
        const u = Math.min(1, local / c.cycle);
        const y = u >= 1 ? 0.2 : lerp(9.5, 0.2, u * u * 0.4 + u * 0.6);
        return <Chunk key={i} p={[c.x, y, c.z]} s={c.s} rot={[c.ph + frame * c.spin, c.ph * 2, c.ph]} squash={u >= 1 && local < c.cycle + 4 ? 0.75 : 1} />;
      })}
    </group>
  );
}

function Human({ pos, rotY = 0, torso = "#8a5a38", skirtColor, hat = "none", hair = "#4a3428", armMode = "down" }: {
  pos: [number, number, number]; rotY?: number; torso?: string; skirtColor?: string; hat?: "none" | "brim"; hair?: string; armMode?: "down" | "stir" | "hold";
}) {
  const frame = useCurrentFrame();
  const stir = armMode === "stir";
  const armR = stir ? -1.05 + Math.sin(frame * 0.16) * 0.3 : armMode === "hold" ? -0.55 : 0.1 + Math.sin(frame * 0.03 + pos[0]) * 0.04;
  const armL = stir ? -0.45 + Math.cos(frame * 0.16) * 0.18 : armMode === "hold" ? -0.55 : 0.1;
  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      {skirtColor ? (
        <>
          <mesh position={[0, 0.48, 0]} castShadow>
            <cylinderGeometry args={[0.30, 0.56, 0.96, 14]} />
            <meshStandardMaterial color={skirtColor} roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.58, 0.37]} rotation={[0.13, 0, 0]}>
            <boxGeometry args={[0.36, 0.5, 0.03]} />
            <meshStandardMaterial color="#e8e0cc" roughness={0.9} />
          </mesh>
        </>
      ) : (
        <>
          <mesh position={[-0.15, 0.4, 0]} castShadow>
            <cylinderGeometry args={[0.095, 0.105, 0.8, 8]} />
            <meshStandardMaterial color="#4c4238" roughness={0.9} />
          </mesh>
          <mesh position={[0.15, 0.4, 0]} castShadow>
            <cylinderGeometry args={[0.095, 0.105, 0.8, 8]} />
            <meshStandardMaterial color="#4c4238" roughness={0.9} />
          </mesh>
        </>
      )}
      {/* torso */}
      <mesh position={[0, 1.33, 0]} castShadow>
        <cylinderGeometry args={[0.27, 0.34, 0.82, 14]} />
        <meshStandardMaterial color={torso} roughness={0.9} />
      </mesh>
      {/* arms on shoulder pivots */}
      <group position={[-0.37, 1.62, 0]} rotation={[armL, 0, 0.14]}>
        <mesh position={[0, -0.3, 0]} castShadow>
          <cylinderGeometry args={[0.075, 0.07, 0.6, 8]} />
          <meshStandardMaterial color={torso} roughness={0.9} />
        </mesh>
        <mesh position={[0, -0.63, 0]}>
          <sphereGeometry args={[0.09, 10, 8]} />
          <meshStandardMaterial color="#f6f1e7" roughness={0.7} />
        </mesh>
      </group>
      <group position={[0.37, 1.62, 0]} rotation={[armR, 0, -0.14]}>
        <mesh position={[0, -0.3, 0]} castShadow>
          <cylinderGeometry args={[0.075, 0.07, 0.6, 8]} />
          <meshStandardMaterial color={torso} roughness={0.9} />
        </mesh>
        <mesh position={[0, -0.63, 0]}>
          <sphereGeometry args={[0.09, 10, 8]} />
          <meshStandardMaterial color="#f6f1e7" roughness={0.7} />
        </mesh>
      </group>
      {/* big white head */}
      <group position={[0, 2.08, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.41, 24, 18]} />
          <meshStandardMaterial color="#f6f1e7" roughness={0.6} />
        </mesh>
        <mesh position={[-0.145, 0.03, 0.365]}>
          <sphereGeometry args={[0.043, 8, 8]} />
          <meshStandardMaterial color="#241d24" roughness={0.4} />
        </mesh>
        <mesh position={[0.145, 0.03, 0.365]}>
          <sphereGeometry args={[0.043, 8, 8]} />
          <meshStandardMaterial color="#241d24" roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.14, 0.385]}>
          <boxGeometry args={[0.13, 0.022, 0.012]} />
          <meshStandardMaterial color="#8a6a5a" />
        </mesh>
        {/* hair cap + bun */}
        <mesh position={[0, 0.09, -0.045]} scale={[1, 0.78, 1]}>
          <sphereGeometry args={[0.425, 24, 18]} />
          <meshStandardMaterial color={hair} roughness={0.95} />
        </mesh>
        {skirtColor ? (
          <mesh position={[0, 0.24, -0.34]}>
            <sphereGeometry args={[0.14, 12, 10]} />
            <meshStandardMaterial color={hair} roughness={0.95} />
          </mesh>
        ) : null}
        {hat === "brim" ? (
          <group position={[0, 0.17, 0]}>
            <mesh>
              <cylinderGeometry args={[0.47, 0.47, 0.045, 20]} />
              <meshStandardMaterial color="#c2a15e" roughness={0.9} />
            </mesh>
            <mesh position={[0, 0.1, 0]}>
              <cylinderGeometry args={[0.26, 0.28, 0.17, 16]} />
              <meshStandardMaterial color="#c2a15e" roughness={0.9} />
            </mesh>
          </group>
        ) : null}
      </group>
    </group>
  );
}

function FarmSet() {
  return (
    <group>
      {/* ground + dirt yard */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[70, 70]} />
        <meshStandardMaterial color="#7d9c46" roughness={1} />
      </mesh>
      <mesh position={[-1.6, 0.012, -0.6]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[4.6, 26]} />
        <meshStandardMaterial color="#977952" roughness={1} />
      </mesh>
      {/* farmhouse */}
      <group position={[-2.7, 0, -3.2]}>
        <mesh position={[0, 1.15, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.6, 2.3, 2.9]} />
          <meshStandardMaterial color="#9a7a56" roughness={0.95} />
        </mesh>
        <mesh position={[0, 2.95, 0]} rotation={[0, Math.PI / 4, 0]} scale={[1.3, 1, 1.1]} castShadow>
          <coneGeometry args={[2.15, 1.35, 4]} />
          <meshStandardMaterial color="#5d4630" flatShading roughness={1} />
        </mesh>
        <mesh position={[0.9, 3.15, -0.5]} castShadow>
          <boxGeometry args={[0.42, 1.1, 0.42]} />
          <meshStandardMaterial color="#7d6a58" roughness={1} />
        </mesh>
        {/* door + window on the front face */}
        <mesh position={[-0.8, 0.85, 1.46]}>
          <boxGeometry args={[0.85, 1.7, 0.05]} />
          <meshStandardMaterial color="#4c3826" roughness={1} />
        </mesh>
        <mesh position={[0.95, 1.5, 1.46]}>
          <boxGeometry args={[0.8, 0.8, 0.05]} />
          <meshStandardMaterial color="#e8ddc2" roughness={0.4} />
        </mesh>
        {/* porch: deck, posts, flat roof */}
        <mesh position={[0, 0.09, 2.15]} receiveShadow>
          <boxGeometry args={[3.9, 0.18, 1.5]} />
          <meshStandardMaterial color="#6e563e" roughness={1} />
        </mesh>
        {[-1.8, 1.8].map((x) => (
          <mesh key={x} position={[x, 1.2, 2.75]} castShadow>
            <cylinderGeometry args={[0.07, 0.07, 2.25, 8]} />
            <meshStandardMaterial color="#54432f" roughness={1} />
          </mesh>
        ))}
        <mesh position={[0, 2.38, 2.2]} rotation={[0.1, 0, 0]} castShadow>
          <boxGeometry args={[4.1, 0.09, 1.8]} />
          <meshStandardMaterial color="#54432f" roughness={1} />
        </mesh>
      </group>
      {/* oak tree */}
      <group position={[3.6, 0, -2.6]}>
        <mesh position={[0, 1.1, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.34, 2.2, 9]} />
          <meshStandardMaterial color="#5d4630" roughness={1} />
        </mesh>
        {[[-0.5, 3.1, 0, 1.25], [0.55, 3.5, -0.3, 1.05], [0, 4.1, 0.25, 1.15]].map(([x, y, z, r], i) => (
          <mesh key={i} position={[x, y, z]} castShadow>
            <sphereGeometry args={[r, 18, 14]} />
            <meshStandardMaterial color="#5f7a3d" roughness={1} />
          </mesh>
        ))}
      </group>
      {/* fence line */}
      {[-5.2, -3.4, -1.6, 0.2, 2.0, 3.8, 5.6].map((x) => (
        <mesh key={x} position={[x, 0.5, 2.6]} castShadow>
          <boxGeometry args={[0.16, 1.0, 0.16]} />
          <meshStandardMaterial color="#6e563e" roughness={1} />
        </mesh>
      ))}
      {[0.78, 0.42].map((y) => (
        <mesh key={y} position={[0.2, y, 2.6]}>
          <boxGeometry args={[11.4, 0.09, 0.07]} />
          <meshStandardMaterial color="#7d6248" roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

function Kettle({ pos }: { pos: [number, number, number] }) {
  const frame = useCurrentFrame();
  return (
    <group position={pos}>
      <mesh position={[0, 0.3, 0]} castShadow scale={[1, 0.82, 1]}>
        <sphereGeometry args={[0.31, 18, 14]} />
        <meshStandardMaterial color="#35312c" roughness={0.55} metalness={0.35} />
      </mesh>
      <mesh position={[0, 0.52, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.05, 14]} />
        <meshStandardMaterial color="#57534a" roughness={0.5} metalness={0.3} />
      </mesh>
      {/* fire */}
      <mesh position={[0, 0.07, 0]} scale={[1, 0.7 + Math.sin(frame * 0.5) * 0.12, 1]}>
        <coneGeometry args={[0.2, 0.3, 10]} />
        <meshStandardMaterial color="#e07b2a" emissive="#c25e10" emissiveIntensity={1.6} />
      </mesh>
      {/* steam puffs */}
      {[0, 1, 2].map((i) => {
        const u = ((frame * 0.014 + i * 0.37) % 1);
        return (
          <mesh key={i} position={[Math.sin(u * 6 + i * 2) * 0.08, 0.62 + u * 0.55, 0]}>
            <sphereGeometry args={[0.05 + u * 0.07, 10, 8]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.4 * (1 - u)} roughness={1} />
          </mesh>
        );
      })}
    </group>
  );
}

// Camera: hard cuts on line starts, strong move inside each scene.
function Rig() {
  const frame = useCurrentFrame();
  const { camera } = useThree();
  let pos: [number, number, number], look: [number, number, number];
  if (frame < 101) {
    const u = smooth(frame / 100);
    pos = [lerp(0, 1.0, u), lerp(3.6, 2.9, u), lerp(13.2, 10.0, u)];
    look = [lerp(0, -0.6, u), 1.5, -1.6];
  } else if (frame < 241) {
    const u = smooth((frame - 101) / 139);
    const a = lerp(-0.55, 0.4, u), rad = lerp(8.6, 6.9, u);
    pos = [Math.sin(a) * rad, lerp(2.3, 1.65, u), -1 + Math.cos(a) * rad];
    look = [-0.7, 1.25, -1.9];
  } else {
    const u = smooth((frame - 241) / 88);
    pos = [lerp(0.9, 0.3, u), lerp(2.15, 2.0, u), lerp(3.6, 2.95, u)];
    look = [-2.35, 1.25, -0.6];
  }
  camera.position.set(pos[0], pos[1], pos[2]);
  camera.lookAt(look[0], look[1], look[2]);
  return null;
}

function Scene() {
  const frame = useCurrentFrame();
  const firstChunkStart = WF(0, 4); // "rained" f58
  const rainStart = WF(0, 5);       // "meat" f69
  const porchRain = WF(2, 8);       // "when" f298
  const fu = clamp01((frame - firstChunkStart) / 20);
  return (
    <>
      <color attach="background" args={["#8fc3ea"]} />
      <fog attach="fog" args={["#a9cdec", 22, 48]} />
      <hemisphereLight args={["#cfe6fa", "#7d8c52", 1.0]} />
      <directionalLight position={[7, 13, 8]} intensity={2.1} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-13} shadow-camera-right={13} shadow-camera-top={13} shadow-camera-bottom={-13} />
      <directionalLight position={[-6, 8, 11]} intensity={0.6} />
      <Rig />
      <FarmSet />
      {/* the first single chunk at "rained" */}
      {frame >= firstChunkStart && frame < rainStart + 40 && (
        <Chunk p={[1.7, fu >= 1 ? 0.22 : lerp(9, 0.22, fu * fu), -0.9]} s={0.34} rot={[fu * 3.2, 0.7, fu * 1.6]} squash={fu >= 1 && frame < firstChunkStart + 24 ? 0.78 : 1} />
      )}
      {frame < 101 && <Rain start={rainStart} count={15} seed={11} area={[-5.5, 5.5, -4, 1.2]} />}
      {frame >= 101 && frame < 241 && <Rain start={101} count={26} seed={23} area={[-6, 6, -4.5, 1.5]} />}
      {/* Mrs. Crouch on the porch for scene C */}
      {frame >= 241 && (
        <group>
          <Human pos={[-2.15, 0.18, -0.85]} rotY={0.5} torso="#7a4a56" skirtColor="#7a4a56" hair="#4a3428" armMode="stir" />
          <Kettle pos={[-2.5, 0.18, -0.08]} />
          <Rain start={porchRain} count={10} seed={31} area={[-5, 0.6, -2.6, 0.6]} />
        </group>
      )}
    </>
  );
}

// ---------- captions (same 2-word pair system as the 2D build) ----------
function Captions() {
  const frame = useCurrentFrame();
  const t = frame / 30;
  let cur = -1;
  for (let i = 0; i < FLAT.length; i++) if (t >= FLAT[i].start) cur = i;
  if (cur < 0) return null;
  const pairIdx = Math.floor(cur / 2) * 2;
  const pair = [FLAT[pairIdx], FLAT[pairIdx + 1]].filter(Boolean);
  const nextStart = FLAT[pairIdx + 2] ? FLAT[pairIdx + 2].start : Infinity;
  if (t >= nextStart) return null;
  return (
    <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center" }}>
      <div style={{
        marginTop: 1420, maxWidth: 1000, textAlign: "center",
        fontFamily: "'Arial Black', Arial, sans-serif", fontWeight: 900, fontSize: 96,
        lineHeight: 1.12, color: "white", letterSpacing: 0.5,
        textShadow: "-5px -5px 0 #14100e, 5px -5px 0 #14100e, -5px 5px 0 #14100e, 5px 5px 0 #14100e, -5px 0 0 #14100e, 5px 0 0 #14100e, 0 -5px 0 #14100e, 0 5px 0 #14100e, 0 10px 24px rgba(0,0,0,0.45)",
      }}>
        {pair.map((w, i) => (
          <span key={i} style={RED.has(`${w.line}:${w.word}`) ? { backgroundColor: "#e5322d", borderRadius: 10, padding: "0 12px", marginRight: i === 0 ? 18 : 0 } : { marginRight: i === 0 ? 18 : 0 }}>
            {w.word}
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
}

export const MeatProof = () => {
  const { width, height } = { width: 1080, height: 1920 };
  return (
    <AbsoluteFill style={{ backgroundColor: "#8fc3ea" }}>
      <ThreeCanvas shadows width={width} height={height} camera={{ fov: 55, position: [0, 3.6, 13.2] }}>
        <Scene />
      </ThreeCanvas>
      <Captions />
    </AbsoluteFill>
  );
};
