// Small map of the south pole (80S to 90S). Click it to add a custom site.
import type { Site } from "../types";
import { SITE_COLORS } from "../colors";
import { siteKey } from "./SitePicker";

interface Props {
  sites: Site[];
  selected: Site[];
  onPick: (lat: number, lon: number) => void;
}

const SIZE = 260;
const C = SIZE / 2;
const R = C - 28;          // pixel radius of latitude 80S
const EDGE_LAT = -80;

function toXY(lat: number, lon: number) {
  const r = ((90 + lat) / (90 + EDGE_LAT)) * R;
  const a = (lon * Math.PI) / 180;
  return { x: C + r * Math.sin(a), y: C - r * Math.cos(a) };   // lon 0 is up
}

export default function PolarMap({ sites, selected, onPick }: Props) {
  function handleClick(e: React.MouseEvent<SVGSVGElement>) {
    const box = e.currentTarget.getBoundingClientRect();
    const dx = ((e.clientX - box.left) / box.width) * SIZE - C;
    const dy = C - ((e.clientY - box.top) / box.height) * SIZE;
    const r = Math.hypot(dx, dy);
    if (r > R) return;
    const lat = -90 + (r / R) * (90 + EDGE_LAT);
    const lon = (Math.atan2(dx, dy) * 180) / Math.PI;
    onPick(Number(lat.toFixed(3)), Number(lon.toFixed(3)));
  }

  const visible = [...sites, ...selected.filter((s) => !s.id)].filter((s) => s.lat <= EDGE_LAT);

  return (
    <div className="panel">
      <h2>South pole map <small>(click to add a site)</small></h2>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="polar" onClick={handleClick}>
        {[-80, -82, -84, -86, -88].map((lat) => (
          <circle key={lat} cx={C} cy={C} r={((90 + lat) / 10) * R} className="grid" />
        ))}
        {[0, 90, 180, 270].map((lon) => {
          const p = toXY(EDGE_LAT, lon);
          return (
            <g key={lon}>
              <line x1={C} y1={C} x2={p.x} y2={p.y} className="grid" />
              <text x={C + (p.x - C) * 1.13} y={C + (p.y - C) * 1.1 + 4} className="tick" textAnchor="middle">
                {lon === 0 ? "0°" : lon === 180 ? "180°" : lon === 90 ? "90°E" : "90°W"}
              </text>
            </g>
          );
        })}
        {visible.map((site) => {
          const p = toXY(site.lat, site.lon);
          const index = selected.findIndex((s) => siteKey(s) === siteKey(site));
          return (
            <g key={siteKey(site)}>
              <circle cx={p.x} cy={p.y} r={index >= 0 ? 6 : 3.5}
                fill={index >= 0 ? SITE_COLORS[index] : "#8b93a7"} stroke="#0d1220" strokeWidth={1} />
              {index >= 0 && <text x={p.x + 8} y={p.y + 4} className="map-label">{site.id ?? "custom"}</text>}
            </g>
          );
        })}
      </svg>
      <div className="hint">Rings every 2° of latitude. Sites north of 80°S are not drawn here.</div>
    </div>
  );
}
