"""Turns a timeline into the numbers a mission planner wants."""


def _windows(timeline: list[dict], flag: str, step_hours: float) -> list[dict]:
    """Continuous periods where `flag` is true."""
    windows, start = [], None
    for i, row in enumerate(timeline):
        if row[flag] and start is None:
            start = i
        if start is not None and (not row[flag] or i == len(timeline) - 1):
            last = i if row[flag] else i - 1
            windows.append({"start": timeline[start]["t"], "end": timeline[last]["t"],
                            "hours": round((last - start + 1) * step_hours, 1)})
            start = None
    return windows


def _next_change(timeline: list[dict], flag: str) -> dict:
    """First time the state flips after the start (sunset or sunrise)."""
    first = timeline[0][flag]
    for row in timeline[1:]:
        if row[flag] != first:
            return {"event": "set" if first else "rise", "t": row["t"]}
    return {"event": "none_in_range", "t": None}


def _longest_gap_hours(timeline: list[dict], flag: str, step_hours: float) -> float:
    longest = current = 0
    for row in timeline:
        current = 0 if row[flag] else current + 1
        longest = max(longest, current)
    return round(longest * step_hours, 1)


def compute_metrics(timeline: list[dict], step_minutes: int) -> dict:
    step_hours = step_minutes / 60.0
    n = len(timeline)
    sun = sum(r["sun_visible"] for r in timeline)
    earth = sum(r["earth_visible"] for r in timeline)
    both = sum(r["sun_visible"] and r["earth_visible"] for r in timeline)
    sun_els = [r["sun_el"] for r in timeline]

    return {
        "total_hours": round(n * step_hours, 1),
        "sunlight_pct": round(100 * sun / n, 1),
        "sunlight_hours": round(sun * step_hours, 1),
        "comm_pct": round(100 * earth / n, 1),
        "comm_hours": round(earth * step_hours, 1),
        "sun_and_earth_pct": round(100 * both / n, 1),
        "sun_el_max_deg": round(max(sun_els), 2),
        "sun_el_mean_deg": round(sum(sun_els) / n, 2),
        "longest_darkness_hours": _longest_gap_hours(timeline, "sun_visible", step_hours),
        "longest_no_comm_hours": _longest_gap_hours(timeline, "earth_visible", step_hours),
        "sun_now": timeline[0]["sun_visible"],
        "earth_now": timeline[0]["earth_visible"],
        "next_sun_change": _next_change(timeline, "sun_visible"),
        "next_earth_change": _next_change(timeline, "earth_visible"),
        "sun_windows": _windows(timeline, "sun_visible", step_hours),
        "comm_windows": _windows(timeline, "earth_visible", step_hours),
    }
