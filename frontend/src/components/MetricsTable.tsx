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
  help: string;                         // shown when hovering the row name
  value: (m: Metrics, s: SiteResult) => string;
  score?: (m: Metrics) => number;       // higher = better, used to mark the best site
}

const ROWS: RowDef[] = [
  { label: "Sunlight (% of time)", help: "Share of the time the Sun is above the terrain horizon, so solar panels can charge.", value: (m) => `${m.sunlight_pct}%`, score: (m) => m.sunlight_pct },
  { label: "Sunlight hours", help: "Total hours with the Sun visible in the selected date range.", value: (m) => `${m.sunlight_hours} h`, score: (m) => m.sunlight_hours },
  { label: "Longest darkness", help: "Longest continuous period without sunlight: the battery must survive this long.", value: (m) => `${m.longest_darkness_hours} h`, score: (m) => -m.longest_darkness_hours },
  { label: "Max Sun elevation", help: "Highest angle of the Sun above the horizon. At the south pole it never gets far above 0°, so panels must stand vertically.", value: (m) => `${m.sun_el_max_deg}°`, score: (m) => m.sun_el_max_deg },
  { label: "Earth contact (% of time)", help: "Share of the time Earth is above the terrain horizon plus the antenna margin, so the lander can talk directly to Earth.", value: (m) => `${m.comm_pct}%`, score: (m) => m.comm_pct },
  { label: "Earth contact hours", help: "Total hours of direct-to-Earth communication.", value: (m) => `${m.comm_hours} h`, score: (m) => m.comm_hours },
  { label: "Longest gap without Earth", help: "Longest period without direct contact with Earth (a relay satellite would be needed).", value: (m) => `${m.longest_no_comm_hours} h`, score: (m) => -m.longest_no_comm_hours },
  { label: "Sun and Earth together", help: "Share of the time with both power and communication, the best time for operations.", value: (m) => `${m.sun_and_earth_pct}%`, score: (m) => m.sun_and_earth_pct },
  { label: "At start: Sun", help: "Is the Sun visible at the start date, and how long until it sets or rises.", value: (m, s) => `${m.sun_now ? "visible" : "hidden"}, ${describeChange(m.next_sun_change, s.timeline[0].t, "sun")}` },
  { label: "At start: Earth", help: "Is Earth visible at the start date, and how long until it sets or rises.", value: (m, s) => `${m.earth_now ? "visible" : "hidden"}, ${describeChange(m.next_earth_change, s.timeline[0].t, "earth")}` },
  { label: "Horizon data", help: "Real terrain from NASA LOLA elevation maps, or a flat horizon when the site is outside the maps.", value: (_m, s) => (s.source === "dem" ? "real terrain (LOLA)" : "flat horizon (no terrain)") },
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
              <td title={row.help} className="has-help">
                {row.label} <span className="help-icon" aria-hidden="true">?</span>
              </td>
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
