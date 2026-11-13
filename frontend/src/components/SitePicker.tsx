// Left panel: choose curated sites or add custom coordinates.
import { useState } from "react";
import type { Site } from "../types";

interface Props {
  sites: Site[];
  selected: Site[];
  maxSites: number;
  onChange: (sites: Site[]) => void;
}

const GROUP_LABELS: Record<string, string> = {
  artemis: "Artemis III candidate regions",
  clps: "CLPS landers",
  international: "Other countries",
  apollo: "Apollo (equator, for contrast)",
  custom: "Custom",
};

export const siteKey = (s: Site) => s.id ?? `${s.lat},${s.lon}`;

export default function SitePicker({ sites, selected, maxSites, onChange }: Props) {
  const [lat, setLat] = useState("-89.5");
  const [lon, setLon] = useState("0");
  const [error, setError] = useState("");

  const isSelected = (s: Site) => selected.some((x) => siteKey(x) === siteKey(s));
  const full = selected.length >= maxSites;

  function toggle(site: Site) {
    if (isSelected(site)) onChange(selected.filter((x) => siteKey(x) !== siteKey(site)));
    else if (!full) onChange([...selected, site]);
  }

  function addCustom() {
    const la = Number(lat);
    const lo = Number(lon);
    if (lat.trim() === "" || lon.trim() === "" || Number.isNaN(la) || Number.isNaN(lo)) {
      return setError("Enter numbers for latitude and longitude");
    }
    if (la < -90 || la > 90 || lo < -180 || lo > 360) {
      return setError("Latitude -90..90, longitude -180..360");
    }
    if (full) return setError(`Maximum ${maxSites} sites`);
    setError("");
    onChange([...selected, { name: `Custom ${la.toFixed(2)}, ${lo.toFixed(2)}`, group: "custom", lat: la, lon: lo }]);
  }

  const groups = [...new Set(sites.map((s) => s.group ?? "custom"))];
  const customs = selected.filter((s) => !s.id);

  return (
    <div className="panel">
      <h2>1. Sites <small>({selected.length}/{maxSites})</small></h2>
      {groups.map((group) => (
        <div key={group} className="group">
          <div className="group-title">{GROUP_LABELS[group] ?? group}</div>
          {sites.filter((s) => (s.group ?? "custom") === group).map((site) => (
            <label key={siteKey(site)} className="check">
              <input
                type="checkbox"
                checked={isSelected(site)}
                disabled={!isSelected(site) && full}
                onChange={() => toggle(site)}
              />
              {site.name}
              <span className="coords">{site.lat.toFixed(2)}, {site.lon.toFixed(2)}</span>
            </label>
          ))}
        </div>
      ))}
      {customs.length > 0 && (
        <div className="group">
          <div className="group-title">Custom</div>
          {customs.map((site) => (
            <label key={siteKey(site)} className="check">
              <input type="checkbox" checked onChange={() => toggle(site)} />
              {site.name}
            </label>
          ))}
        </div>
      )}
      <div className="group-title">Add custom coordinates</div>
      <div className="row">
        <input aria-label="Latitude" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="lat" />
        <input aria-label="Longitude" value={lon} onChange={(e) => setLon(e.target.value)} placeholder="lon (E)" />
        <button onClick={addCustom}>Add</button>
      </div>
      {error && <div className="error">{error}</div>}
    </div>
  );
}
