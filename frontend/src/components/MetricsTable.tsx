// Side-by-side comparison of the key numbers for each site.
import type { Metrics, NextChange, SiteResult } from "../types";
import { SITE_COLORS } from "../colors";

interface Props {
  sites: SiteResult[];
}

function describeChange(change: NextChange, startIso: string, noun: string) {
  if (change.event === "none_in_range" || !change.t) return "no change in range";
  const hours = (Date.parse(change.t) - Date.parse(startIso)) / 3_600_000;
  const when = hours >= 48 ? `${(hours / 24).toFixed(1)} days` : `${hours.toFixed(0)} h`;
  return `${noun}${change.event} in ${when}`;
}

interface RowDef {
  label: string;
  value: (m: Metrics, s: SiteResult) => string;
  score?: (m: Metrics) => number;       // higher = better, used to mark the best site
}

const ROWS: RowDef[] = [
  { label: "Sunlight (% of time)", value: (m) => `${m.sunlight_pct}%`, score: (m) => m.sunlight_pct },
  { label: "Sunlight hours", value: (m) => `${m.sunlight_hours} h`, score: (m) => m.sunlight_hours },
  { label: "Longest darkness", value: (m) => `${m.longest_darkness_hours} h`, score: (m) => -m.longest_darkness_hours },
  { label: "Max Sun elevation", value: (m) => `${m.sun_el_max_deg}°`, score: (m) => m.sun_el_max_deg },
  { label: "Earth contact (% of time)", value: (m) => `${m.comm_pct}%`, score: (m) => m.comm_pct },
  { label: "Earth contact hours", value: (m) => `${m.comm_hours} h`, score: (m) => m.comm_hours },
  { label: "Longest gap without Earth", value: (m) => `${m.longest_no_comm_hours} h`, score: (m) => -m.longest_no_comm_hours },
  { label: "Sun and Earth together", value: (m) => `${m.sun_and_earth_pct}%`, score: (m) => m.sun_and_earth_pct },
  { label: "At start: Sun", value: (m, s) => `${m.sun_now ? "visible" : "hidden"}, ${describeChange(m.next_sun_change, s.timeline[0].t, "sun")}` },
  { label: "At start: Earth", value: (m, s) => `${m.earth_now ? "visible" : "hidden"}, ${describeChange(m.next_earth_change, s.timeline[0].t, "earth")}` },
  { label: "Horizon data", value: (_m, s) => (s.source === "dem" ? "real terrain (LOLA)" : "flat horizon (no terrain)") },
];

export default function MetricsTable({ sites }: Props) {
  return (
    <div className="scroll-x">
    <table className="metrics">
      <thead>
        <tr>
          <th></th>
          {sites.map((site, i) => (
            <th key={i}>
              <span className="dot" style={{ background: SITE_COLORS[i] }} />
              {site.name}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {ROWS.map((row) => {
          const scores = row.score ? sites.map((s) => row.score!(s.metrics)) : [];
          const best = scores.length > 1 ? Math.max(...scores) : null;
          const tie = best !== null && scores.every((v) => v === best);
          return (
            <tr key={row.label}>
              <td>{row.label}</td>
              {sites.map((site, i) => (
                <td key={i} className={best !== null && !tie && scores[i] === best ? "best" : ""}>
                  {row.value(site.metrics, site)}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
    </div>
  );
}
