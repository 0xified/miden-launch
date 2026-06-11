import Lenis from "lenis";

export interface ScrollState {
  /** overall page progress, 0..1, already smoothed by Lenis */
  p: number;
  /** scroll velocity (px/frame-ish, Lenis units) */
  v: number;
  /** prefers-reduced-motion */
  reduced: boolean;
}

const state: ScrollState = { p: 0, v: 0, reduced: false };
const subs = new Set<(s: ScrollState) => void>();
let started = false;

function notify() {
  for (const fn of subs) fn(state);
}

export function startScroll() {
  if (started || typeof window === "undefined") return;
  started = true;
  state.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (state.reduced) {
    // No smoothing, no hijacking — plain native scroll mapped to progress.
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      state.p = max > 0 ? window.scrollY / max : 0;
      state.v = 0;
      notify();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return;
  }

  const lenis = new Lenis({ lerp: 0.1 });
  lenis.on("scroll", (l: Lenis) => {
    state.p = l.progress ?? 0;
    state.v = l.velocity ?? 0;
    notify();
  });
  const raf = (t: number) => {
    lenis.raf(t);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);
}

export function onScrollChange(fn: (s: ScrollState) => void) {
  subs.add(fn);
  fn(state);
  return () => {
    subs.delete(fn);
  };
}

export const getScrollState = () => state;

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/** smoothstep ramp from a..b over progress p */
export function phase(p: number, a: number, b: number) {
  const t = clamp01((p - a) / (b - a));
  return t * t * (3 - 2 * t);
}
