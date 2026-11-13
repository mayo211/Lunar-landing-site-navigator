# Space Apps 2026 submission – Lunar Landing Site Navigator

Copy each section into the matching box of the submission form.
Before submitting: make the GitHub repo public, and share the slide deck publicly.

## Project name
Lunar Landing Site Navigator

## High-level project summary
Lunar Landing Site Navigator is a web app that lets mission planners, educators and
the public compare Moon landing sites and dates in seconds. For each site it combines
NASA JPL Horizons Sun and Earth positions with a real terrain horizon computed from
NASA LRO LOLA elevation maps, then shows, hour by hour, when the site has sunlight for
power and when Earth is visible for direct communication. It answers the question NASA
planners face when a schedule slips: how much better or worse is this site, or this
date? One click shifts the landing by a week and updates every compared site.

## Link to project demo
[paste the public link to the slide deck or the 30-second video]

## Link to final project
https://github.com/mayo211/Lunar-landing-site-navigator

## Detailed project description
**What it does**
- Pick up to three sites: Artemis III candidate regions (representative sites),
  the IM-2 landing site, Chandrayaan-3, Chang'e-4 and Apollo 11/15/17, or click any
  point on the south-pole map.
- Choose a date range, a time step and the antenna margin (how far above the horizon
  Earth must be for a link).
- See, for every site: sunlight %, sunlight hours, longest darkness, maximum Sun
  elevation, Earth contact % and hours, longest gap without Earth, the share of time
  with both, and the time until the next sunset or Earthset.
- Views: comparison table (best value highlighted), timeline of power and contact
  windows, 360° horizon panorama with the Sun's and Earth's paths, and a 3D sky view.
  Every metric has a plain-language explanation for non-specialists.
- "1 week earlier / later" buttons answer the schedule-slip question instantly.

**How it works**
1. Sky: NASA JPL Horizons returns the Sun's and Earth's azimuth and elevation from the
   site (observer on the Moon, no atmosphere, libration included).
2. Ground: from LOLA polar elevation maps (80 m/px to 80°S, 240 m/px to 60°S) we cast
   360 rays up to 250 km from the site and compute the highest terrain angle in each
   direction, using exact spherical geometry (the Moon's curvature).
3. Compare: at every time step the Sun is "visible" if it is above the terrain horizon
   in its direction, and Earth is "in contact" if it is above the horizon plus the
   antenna margin.
4. Results are cached, so scenarios load instantly and work offline in a demo.

**Example findings (14 Nov – 14 Dec 2026, 2° margin)**
- Slater Plain has the most sunlight (62.7%) but sees Earth only 21.2% of the time, so
  it has both for just 9.3%.
- Peak near Cabeus B is lit half the time but sees Earth only 8% and never has both.
- The IM-2 landing area on Mons Mouton gives the best balance (51.9% with both).
- Landing one week later almost doubles Slater Plain's time with both (9.3% → 17.8%);
  landing two weeks later doubles Peak near Cabeus B's longest night (175 h → 349 h).

**Tech**
Python 3.13, FastAPI, NumPy, rasterio, pyproj (backend); React, TypeScript, Vite,
three.js / React Three Fiber (frontend).

**Benefits**
Planners can re-evaluate sites and dates in seconds when hardware or launch schedules
change; teachers and the public can see why the lunar south pole is so hard compared
with the Apollo sites.

## NASA data
- NASA/JPL Horizons System – Sun and Earth ephemerides: https://ssd.jpl.nasa.gov/horizons/
- NASA LRO LOLA polar digital elevation models (NASA PGDA product 90):
  https://pgda.gsfc.nasa.gov/products/90
- NASA Artemis III candidate landing regions (NASA NTRS 20250011660)
- Apollo landing site coordinates – NASA NSSDC:
  https://nssdc.gsfc.nasa.gov/planetary/lunar/lunar_sites.html

## Space agency partner & other data
- Representative Artemis III site coordinates: Wueller et al. (2026), JGR Planets,
  doi:10.1029/2025JE009434
- Chandrayaan-3 landing site (ISRO, Shiv Shakti Point); Chang'e-4 landing site (CNSA, via NAO/CAS)
- Open-source libraries: FastAPI, NumPy, rasterio, pyproj, React, Vite, three.js

## Use of artificial intelligence
Parts of the code, documentation, slides and planning were drafted with AI assistants
(Claude by Anthropic, ChatGPT by OpenAI). The team reviewed, ran and tested all code and
checked the results against NASA data. No AI-generated images or videos are used; the
app screenshot in the slides is a real capture of our app.

## 30-second video script (if you make a video instead of slides)
1. (0–5 s) Title + south-pole map: "At the Moon's south pole, the Sun and Earth skim
   the horizon. One hill can cut power or radio for days."
2. (5–15 s) Click "★ Demo comparison": "We combine NASA Horizons and LOLA terrain to
   show, hour by hour, when each site has sunlight and Earth contact."
3. (15–23 s) Click "1 week later": "When a launch slips, one click shows what changes:
   Slater Plain's working time almost doubles."
4. (23–30 s) Horizon panorama + 3D view: "Lunar Landing Site Navigator: compare sites
   and dates in seconds. Team AstraSpace, Cairo."
