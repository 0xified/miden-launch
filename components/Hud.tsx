"use client";

import { useEffect, useRef } from "react";
import { onScrollChange, phase } from "@/lib/scroll";
import { actIndex } from "@/lib/choreo";

export default function Hud() {
  const bar = useRef<HTMLDivElement>(null);
  const act = useRef<HTMLSpanElement>(null);
  const hint = useRef<HTMLDivElement>(null);

  useEffect(
    () =>
      onScrollChange((s) => {
        if (bar.current) bar.current.style.transform = `scaleX(${s.p})`;
        if (act.current) act.current.textContent = `0${actIndex(s.p)}`;
        if (hint.current) hint.current.style.opacity = String(1 - phase(s.p, 0.005, 0.04));
      }),
    []
  );

  return (
    <>
      <div className="bar" ref={bar} />
      <header className="hud">
        <div className="brand">
          MIDEN <span>/ teaser concept</span>
        </div>
        <div className="counter">
          <span ref={act}>01</span> / 05
        </div>
      </header>
      <div className="hint" ref={hint}>
        Scroll
      </div>
    </>
  );
}
