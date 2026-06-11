import { phase } from "./scroll";

// Section heights in vh. Total page = sum; scrollable = sum - 100.
export const HEIGHTS = { a1: 130, a2: 170, a3: 190, a4: 200, a5: 220 };

// Progress ranges per act, derived from HEIGHTS (scrollable = 810vh).
export const ACTS: Record<string, [number, number]> = {
  a1: [0, 0.16],
  a2: [0.16, 0.37],
  a3: [0.37, 0.605],
  a4: [0.605, 0.852],
  a5: [0.852, 1],
};

// Every scroll-driven value — GL uniforms and DOM effects — reads from
// these same curves so the scene and the copy stay in lockstep.
const field = (p: number) => phase(p, 0.62, 0.75) * (1 - phase(p, 0.86, 0.95));

export const cues = {
  /** scattered fragments -> assembled cube (act 2) */
  assemble: (p: number) => phase(p, 0.17, 0.34),
  /** the failed x-ray: surface strains outward, then snaps back (act 3) */
  strain: (p: number) => phase(p, 0.4, 0.48) * (1 - phase(p, 0.5, 0.56)),
  /** proof lattice: appears only AFTER the x-ray fails; embers while
   *  dispersed; restrained glow in the finale */
  lattice: (p: number) =>
    Math.max(phase(p, 0.52, 0.6), 0.55 * phase(p, 0.9, 0.97)) *
    (1 - 0.72 * field(p)),
  /** cube disperses into a field of local provers, then reforms (act 4 -> 5) */
  field,
  /** cube drifts right while copy owns the left column (acts 2-3) */
  shiftX: (p: number) => 0.7 * phase(p, 0.16, 0.24) * (1 - phase(p, 0.58, 0.66)),
  /** finale: cube recedes so the closing copy owns the foreground */
  recede: (p: number) => 1.6 * phase(p, 0.9, 0.97),
};

export function actIndex(p: number) {
  const keys = Object.keys(ACTS);
  for (let i = keys.length - 1; i >= 0; i--) {
    if (p >= ACTS[keys[i]][0]) return i + 1;
  }
  return 1;
}
