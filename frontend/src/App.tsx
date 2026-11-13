import { useEffect, useState } from "react";
import { getSites, getVisibility } from "./api";
import type { Site, VisibilityResponse } from "./types";
import { EARTH_COLOR, SITE_COLORS, SUN_COLOR } from "./colors";
import SitePicker from "./components/SitePicker";
import PolarMap from "./components/PolarMap";
import HorizonChart from "./components/HorizonChart";
import Timeline from "./components/Timeline";
import MetricsTable from "./components/MetricsTable";
import SkyView3D from "./components/SkyView3D";

const MAX_SITES = 3;

function plusDays(iso: string, days: number) {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function App() {
  const [sites, setSites] = useState<Site[]>([]);
  const [selected, setSelected] = useState<Site[]>([]);
  const [start, setStart] = useState("2026-11-14");
  const [end, setEnd] = useState("2026-12-14");
  const [stepMinutes, setStepMinutes] = useState(60);
  const [mask, setMask] = useState(2);
  const [result, setResult] = useState<VisibilityResponse | null>(null);
  const [active, setActive] = useState(0);
  const [timeIndex, setTimeIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getSites()
      .then((list) => {
        setSites(list);
        setSelected(list.slice(0, 2));
      })
      .catch(() => setError("Cannot reach the backend. Is it running on port 8000?"));
  }, []);

  async function run(newStart = start, newEnd = end) {
    if (selected.length === 0) return setError("Choose at least one site");
    if (newEnd <= newStart) return setError("End date must be after start date");
    setLoading(true);
    setError("");
    try {
      const data = await getVisibility({
        sites: selected, start: newStart, end: newEnd,
        step_minutes: stepMinutes, earth_mask_deg: mask,
      });
      setResult(data);
      setActive(0);
      setTimeIndex(0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  // "What if the landing slips?" - move both dates and run again.
  function shift(days: number) {
    const s = plusDays(start, days);
    const e = plusDays(end, days);
    setStart(s);
    setEnd(e);
    run(s, e);
  }

  const site = result?.sites[Math.min(active, (result?.sites.length ?? 1) - 1)];
  const now = site?.timeline[Math.min(timeIndex, site.timeline.length - 1)];

  return (
    <div className="app">
      <header>
        <h1>Lunar Landing Site Navigator</h1>
        <p>Compare landing sites and dates: when is the Sun up (power) and when is Earth in view (communication)?</p>
      </header>

      <div className="layout">
        <aside>
          <SitePicker sites={sites} selected={selected} maxSites={MAX_SITES} onChange={setSelected} />
          <PolarMap
            sites={sites}
            selected={selected}
            onPick={(lat, lon) => {
              if (selected.length >= MAX_SITES) return setError(`Maximum ${MAX_SITES} sites. Untick one first.`);
              setError("");
              setSelected([...selected, { name: `Custom ${lat.toFixed(2)}, ${lon.toFixed(2)}`, group: "custom", lat, lon }]);
            }}
          />
          <div className="panel">
            <h2>2. Dates and settings</h2>
            <label className="field">Start
              <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            </label>
            <label className="field">End
              <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
            </label>
            <label className="field">Time step
              <select value={stepMinutes} onChange={(e) => setStepMinutes(Number(e.target.value))}>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={180}>3 hours</option>
                <option value={360}>6 hours</option>
              </select>
            </label>
            <label className="field">Earth must be above horizon by
              <select value={mask} onChange={(e) => setMask(Number(e.target.value))}>
                {[0, 1, 2, 3, 5].map((v) => <option key={v} value={v}>{v}°</option>)}
              </select>
            </label>
            <button className="primary" onClick={() => run()} disabled={loading}>
              {loading ? "Calculating…" : "Compare sites"}
            </button>
            <div className="row">
              <button onClick={() => shift(-7)} disabled={loading}>◀ 1 week earlier</button>
              <button onClick={() => shift(7)} disabled={loading}>1 week later ▶</button>
            </div>
            {error && <div className="error">{error}</div>}
          </div>
        </aside>

        <main>
          {!result && !loading && (
            <div className="panel empty">
              Choose up to {MAX_SITES} sites and a date range, then press <b>Compare sites</b>.
              <br />Tip: compare a south pole site with Apollo 11 to see why the pole is so different.
            </div>
          )}
          {loading && <div className="panel empty">Asking NASA JPL Horizons and checking the terrain…</div>}

          {result && site && now && !loading && (
            <>
              <div className="panel">
                <h2>Comparison <small>{result.start} → {result.end}</small></h2>
                <MetricsTable sites={result.sites} />
              </div>

              <div className="panel">
                <h2>Timeline <small>(click to move the time)</small></h2>
                <Timeline sites={result.sites} timeIndex={timeIndex} onSeek={setTimeIndex} />
              </div>

              <div className="panel">
                <div className="tabs">
                  {result.sites.map((s, i) => (
                    <button key={i} className={i === active ? "tab on" : "tab"} onClick={() => setActive(i)}>
                      <span className="dot" style={{ background: SITE_COLORS[i] }} />{s.name}
                    </button>
                  ))}
                </div>
                <h2>Horizon panorama <small>{site.name}</small></h2>
                <div className="legend">
                  <span><i style={{ background: SUN_COLOR }} /> Sun path</span>
                  <span><i style={{ background: EARTH_COLOR }} /> Earth path</span>
                  <span><i style={{ background: "#8d8f96" }} /> Terrain horizon</span>
                  <span>Faded dots = hidden</span>
                </div>
                <HorizonChart site={site} timeIndex={timeIndex} />
                <input
                  className="slider" type="range" min={0} max={site.timeline.length - 1}
                  value={Math.min(timeIndex, site.timeline.length - 1)}
                  onChange={(e) => setTimeIndex(Number(e.target.value))}
                  aria-label="Time"
                />
                <div className="now">
                  <b>{now.t.replace("T", " ").replace("Z", " UTC")}</b>
                  <span style={{ color: SUN_COLOR }}>
                    Sun {now.sun_el.toFixed(2)}° · {now.sun_visible ? `visible (${now.sun_disk_pct}% of disk)` : "hidden"}
                  </span>
                  <span style={{ color: EARTH_COLOR }}>
                    Earth {now.earth_el.toFixed(2)}° · {now.earth_visible ? "in contact" : "no contact"}
                  </span>
                </div>
                {site.source === "flat_horizon" && (
                  <div className="hint">No terrain data for this site: a flat horizon is used.</div>
                )}
              </div>

              <div className="panel">
                <h2>3D sky view <small>{site.name}</small></h2>
                <SkyView3D site={site} timeIndex={timeIndex} />
              </div>

              <div className="panel explain">
                <h2>Why is the south pole special?</h2>
                <p>The Moon's axis is tilted only about 1.5°, so at the pole the Sun never climbs high. It circles
                  just above the horizon, and a hill can hide it for days. Earth also sits near the horizon and bobs
                  up and down over a month (libration), so radio contact comes and goes. Moving a few kilometres or
                  landing a week later can change both.</p>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
