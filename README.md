# Miden — launch page concept

A scroll-driven narrative/positioning page for [miden.xyz](https://miden.xyz), structurally modeled
on the Stripe Press [*Poor Charlie's Almanack* teaser](https://www.stripe.press/poor-charlies-almanack/teaser):
one hero WebGL object the entire scroll interrogates, native scrolling, real DOM copy
choreographed to the same progress value, everything lerped.

**The hero metaphor:** an opaque voxel cube you can verify but never see inside.
Privacy-that-proves-itself, rendered literally.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
node scripts/shoot.mjs [url]   # headless visual smoke test -> /tmp/miden-*.png
```

## The five acts

| Act | Scroll range | Scene | Copy |
|-----|-------------|-------|------|
| 1 | 0 – .16 | scattered debris drifts behind a marquee of naked transactions | "Every transaction you make is public." |
| 2 | .16 – .37 | fragments assemble into the cube (staggered per-voxel) | "Invert the model…" word-by-word reveal |
| 3 | .37 – .605 | the x-ray fails: surface strains, snaps back, proof lattice ignites | "Opaque to everyone. Verifiable by anyone." |
| 4 | .605 – .852 | cube disperses into a field of local provers | three property beats |
| 5 | .852 – 1 | field reforms; cube recedes, lattice steady | "Privacy that proves itself." + CTAs |

## Architecture

- `lib/choreo.ts` — **the single source of truth.** Every cue (assemble, strain,
  lattice, field, shiftX, recede) is a pure function of scroll progress. The GL
  scene and the DOM both read these curves, so retiming the whole page means
  editing one file.
- `lib/scroll.ts` — Lenis smooth scroll → one progress value + pub/sub.
  Falls back to plain native scroll under `prefers-reduced-motion`.
- `components/VoxelCube.tsx` + `shaders.ts` — 1331 instanced voxels, positions
  computed entirely in the vertex shader from per-instance attributes
  (`aHome`/`aScatter`/`aField`/`aId`). No instance matrices, one draw call.
- `components/Sections.tsx` — sticky-pinned acts, fade ranges, word reveal,
  chromatic-aberration heading (CSS text-shadow driven by the strain cue).
- `components/TxStream.tsx` — deterministic (seeded) fake ledger marquee.

## Tuning knobs

- Pacing: cue windows in `lib/choreo.ts` (keep them inside their act's range).
- Section lengths: `HEIGHTS` in `lib/choreo.ts` — if you change these,
  recompute the `ACTS` fractions (range = cumulative height / (total − 100)).
- Look: `uAccent`/`uBase` colors in `VoxelCube.tsx`; glow/strain magnitudes in
  `shaders.ts`; grain opacity and scrim strength in `app/globals.css`.
- Density: `N` (voxels per edge) in `VoxelCube.tsx`.
