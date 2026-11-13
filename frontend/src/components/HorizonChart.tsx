// 360-degree panorama: terrain horizon + the paths of the Sun and Earth.
import type { SiteResult } from "../types";
import { EARTH_COLOR, SUN_COLOR } from "../colors";

interface Props {
  site: SiteResult;
  timeIndex: number;
}

const W = 900;
const H = 300;
const PAD = { left: 44, right: 30, top: 14, bottom: 30 };

export default function HorizonChart({ site, timeIndex }: Props) {
  const { horizon, timeline } = site;
  const values = [
    ...horizon.map((h) => h.el),
    ...timeline.map((r) => r.sun_el),
    ...timeline.map((r) => r.earth_el),
  ];
  // Keep the view near the horizon so small polar angles are readable.
  const yMin = Math.max(Math.floor(Math.min(...values) - 1), -15);
  const yMax = Math.min(Math.ceil(Math.max(...values) + 1), 30);

  const x = (az: number) => PAD.left + (az / 360) * (W - PAD.left - PAD.right);
  const y = (el: number) => {
    const clamped = Math.min(Math.max(el, yMin), yMax);
    return PAD.top + ((yMax - clamped) / (yMax - yMin)) * (H - PAD.top - PAD.bottom);
  };

  const closed = [...horizon, { az: 360, el: horizon[0].el }];
  const terrain =
    `M ${x(0)} ${y(yMin)} ` + closed.map((h) => `L ${x(h.az)} ${y(h.el)}`).join(" ") + ` L ${x(360)} ${y(yMin)} Z`;

  const yTicks: number[] = [];
  const stepY = yMax - yMin > 20 ? 5 : yMax - yMin > 8 ? 2 : 1;
  for (let v = Math.ceil(yMin / stepY) * stepY; v <= yMax; v += stepY) yTicks.push(v);

  const now = timeline[Math.min(timeIndex, timeline.length - 1)];
  const thin = Math.max(1, Math.floor(timeline.length / 400));   // draw at most ~400 dots

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img"
      aria-label={`Horizon panorama for ${site.name}`}>
      {yTicks.map((v) => (
        <g key={v}>
          <line x1={PAD.left} x2={W - PAD.right} y1={y(v)} y2={y(v)} className={v === 0 ? "zero" : "grid"} />
          <text x={PAD.left - 6} y={y(v) + 4} textAnchor="end" className="tick">{v}°</text>
        </g>
      ))}
      {[0, 90, 180, 270, 360].map((az) => (
        <text key={az} x={x(az)} y={H - 10} textAnchor="middle" className="tick">
          {["N", "E", "S", "W", "N"][az / 90]} {az}°
        </text>
      ))}

      {timeline.filter((_, i) => i % thin === 0).map((r) => (
        <circle key={`e${r.t}`} cx={x(r.earth_az)} cy={y(r.earth_el)} r={2}
          fill={EARTH_COLOR} opacity={r.earth_visible ? 0.9 : 0.25} />
      ))}
      {timeline.filter((_, i) => i % thin === 0).map((r) => (
        <circle key={`s${r.t}`} cx={x(r.sun_az)} cy={y(r.sun_el)} r={2}
          fill={SUN_COLOR} opacity={r.sun_visible ? 0.9 : 0.25} />
      ))}

      <path d={terrain} className="terrain" />

      <circle cx={x(now.sun_az)} cy={y(now.sun_el)} r={8} fill={SUN_COLOR} stroke="#fff" strokeWidth={1.5} />
      <circle cx={x(now.earth_az)} cy={y(now.earth_el)} r={7} fill={EARTH_COLOR} stroke="#fff" strokeWidth={1.5} />
    </svg>
  );
}
