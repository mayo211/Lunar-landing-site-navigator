// 3D view from the landing site: terrain horizon as a ring of hills,
// with the Sun and Earth placed in the sky for the selected time.
import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { SiteResult } from "../types";
import { EARTH_COLOR, SUN_COLOR } from "../colors";

interface Props {
  site: SiteResult;
  timeIndex: number;
}

const RING = 10;            // distance of the horizon wall from the lander
const EXAGGERATE = 4;       // angles are multiplied so tiny polar angles are visible
const FLOOR = -1;           // bottom of the wall

// azimuth (clockwise from north) + elevation -> 3D point. North = -Z, East = +X.
function skyPoint(azDeg: number, elDeg: number, radius: number) {
  const az = (azDeg * Math.PI) / 180;
  const el = Math.max(Math.min(elDeg * EXAGGERATE, 85), -85) * (Math.PI / 180);
  return new THREE.Vector3(
    radius * Math.cos(el) * Math.sin(az),
    radius * Math.sin(el),
    -radius * Math.cos(el) * Math.cos(az)
  );
}

function HorizonWall({ site }: { site: SiteResult }) {
  const geometry = useMemo(() => {
    const positions: number[] = [];
    const h = site.horizon;
    for (let i = 0; i < h.length; i++) {
      const a = h[i];
      const b = h[(i + 1) % h.length];
      const topA = skyPoint(a.az, a.el, RING);
      const topB = skyPoint(b.az, b.el, RING);
      const botA = new THREE.Vector3(topA.x, FLOOR, topA.z);
      const botB = new THREE.Vector3(topB.x, FLOOR, topB.z);
      for (const p of [botA, topA, topB, botA, topB, botB]) positions.push(p.x, p.y, p.z);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    g.computeVertexNormals();
    return g;
  }, [site]);

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color="#8d8f96" side={THREE.DoubleSide} roughness={1} />
    </mesh>
  );
}

function PathDots({ site, body }: { site: SiteResult; body: "sun" | "earth" }) {
  const geometry = useMemo(() => {
    const pts = site.timeline.map((r) =>
      body === "sun" ? skyPoint(r.sun_az, r.sun_el, RING + 2) : skyPoint(r.earth_az, r.earth_el, RING + 2)
    );
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [site, body]);
  return (
    <points geometry={geometry}>
      <pointsMaterial color={body === "sun" ? SUN_COLOR : EARTH_COLOR} size={0.08} />
    </points>
  );
}

export default function SkyView3D({ site, timeIndex }: Props) {
  const now = site.timeline[Math.min(timeIndex, site.timeline.length - 1)];
  const sun = skyPoint(now.sun_az, now.sun_el, RING + 2);
  const earth = skyPoint(now.earth_az, now.earth_el, RING + 2);

  return (
    <div className="sky3d">
      <div className="sky3d-canvas">
      <Canvas camera={{ position: [0, 9, 20], fov: 45 }}>
        <color attach="background" args={["#05070d"]} />
        <ambientLight intensity={0.9} />
        <directionalLight position={sun} intensity={now.sun_visible ? 2.5 : 0.3} />

        {/* ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
          <circleGeometry args={[RING, 96]} />
          <meshStandardMaterial color="#6d7078" roughness={1} />
        </mesh>
        {/* lander */}
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.25, 0.4, 0.8, 12]} />
          <meshStandardMaterial color="#e8e8e8" />
        </mesh>
        {/* north marker (red) */}
        <mesh position={[0, 0.05, -RING * 0.7]} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.3, 1.2, 12]} />
          <meshBasicMaterial color="#ff5a4d" />
        </mesh>

        <HorizonWall site={site} />
        <PathDots site={site} body="sun" />
        <PathDots site={site} body="earth" />

        <mesh position={sun}>
          <sphereGeometry args={[0.45, 24, 24]} />
          <meshBasicMaterial color={SUN_COLOR} transparent opacity={now.sun_visible ? 1 : 0.35} />
        </mesh>
        <mesh position={earth}>
          <sphereGeometry args={[0.55, 24, 24]} />
          <meshBasicMaterial color={EARTH_COLOR} transparent opacity={now.earth_visible ? 1 : 0.35} />
        </mesh>

        <OrbitControls enablePan={false} minDistance={6} maxDistance={40} target={[0, 0.5, 0]} />
      </Canvas>
      </div>
      <div className="hint">
        Drag to rotate. Red cone = north. Angles are exaggerated ×{EXAGGERATE} so the low polar Sun is visible.
        Faded Sun/Earth = hidden behind terrain.
      </div>
    </div>
  );
}
