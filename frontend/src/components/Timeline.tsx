// Bars over time: when each site has sunlight and when it can talk to Earth.
import type { SiteResult } from "../types";
import { EARTH_COLOR, SITE_COLORS, SUN_COLOR } from "../colors";

interface Props {
  sites: SiteResult[];
  timeIndex: number;
  onSeek: (index: number) => void;
}

const W = 900;
const LABEL = 150;
const ROW = 16;
const GAP = 4;
const BLOCK = 2 * ROW + GAP + 14;

function segments(flags: boolean[]) {
  const out: { from: number; to: number }[] = [];
  let start = -1;
  flags.forEach((on, i) => {
    if (on && start < 0) start = i;
    if (start >= 0 && (!on || i === flags.length - 1)) {
      out.push({ from: start, to: on ? i + 1 : i });
      start = -1;
    }
  });
  return out;
}

export default function Timeline({ sites, timeIndex, onSeek }: Props) {
  const n = sites[0].timeline.length;
  const x = (i: number) => LABEL + (i / n) * (W - LABEL - 8);
  const height = sites.length * BLOCK + 22;
  const first = sites[0].timeline;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.min(Math.round(f * (n - 1)), n - 1));

  function handleClick(e: React.MouseEvent<SVGSVGElement>) {
    const box = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - box.left) / box.width) * W;
    const i = Math.round(((px - LABEL) / (W - LABEL - 8)) * n);
    onSeek(Math.min(Math.max(i, 0), n - 1));
  }

  return (
    <svg viewBox={`0 0 ${W} ${height}`} className="chart clickable" onClick={handleClick}
      role="img" aria-label="Sunlight and Earth communication timeline">
      {sites.map((site, s) => {
        const top = s * BLOCK + 4;
        const rows = [
          { label: "Sun", color: SUN_COLOR, flags: site.timeline.map((r) => r.sun_visible) },
          { label: "Earth", color: EARTH_COLOR, flags: site.timeline.map((r) => r.earth_visible) },
        ];
        return (
          <g key={s}>
            <circle cx={8} cy={top + ROW} r={5} fill={SITE_COLORS[s]} />
            <text x={18} y={top + ROW + 4} className="row-label">{site.name.slice(0, 16)}</text>
            {rows.map((row, r) => (
              <g key={row.label}>
                <text x={LABEL - 6} y={top + r * (ROW + GAP) + 12} textAnchor="end" className="tick">{row.label}</text>
                <rect x={LABEL} y={top + r * (ROW + GAP)} width={W - LABEL - 8} height={ROW} className="bar-bg" />
                {segments(row.flags).map((seg) => (
                  <rect key={seg.from} x={x(seg.from)} y={top + r * (ROW + GAP)}
                    width={Math.max(x(seg.to) - x(seg.from), 1)} height={ROW} fill={row.color} />
                ))}
              </g>
            ))}
          </g>
        );
      })}
      {ticks.map((i) => (
        <text key={i} x={x(i)} y={height - 4} className="tick"
          textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"}>
          {first[i].t.slice(5, 10)}
        </text>
      ))}
      <line x1={x(timeIndex)} x2={x(timeIndex)} y1={0} y2={height - 16} className="cursor" />
    </svg>
  );
}
