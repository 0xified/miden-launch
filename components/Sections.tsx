"use client";

import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { onScrollChange, phase, clamp01 } from "@/lib/scroll";
import { ACTS, HEIGHTS, cues } from "@/lib/choreo";
import TxStream from "./TxStream";

/** Sticky full-viewport scene whose content fades on the act's progress range. */
function Act({
  range,
  height,
  center,
  children,
}: {
  range: [number, number];
  height: number;
  center?: boolean;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(
    () =>
      onScrollChange((s) => {
        const el = ref.current;
        if (!el) return;
        const inO = range[0] <= 0 ? 1 : phase(s.p, range[0] + 0.01, range[0] + 0.05);
        const outO = range[1] >= 1 ? 1 : 1 - phase(s.p, range[1] - 0.05, range[1] - 0.005);
        el.style.opacity = String(Math.min(inO, outO));
        el.style.transform = `translateY(${(1 - inO) * 36}px)`;
      }),
    [range]
  );
  return (
    <section className="act" style={{ height: `${height}vh` }}>
      <div className={`pin${center ? " center" : ""}`}>
        <div className="fade" ref={ref}>
          {children}
        </div>
      </div>
    </section>
  );
}

/** Crossfading sub-beat inside an act (absolute, stacked). */
function Beat({
  range,
  index,
  title,
  children,
}: {
  range: [number, number];
  index: string;
  title: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(
    () =>
      onScrollChange((s) => {
        const el = ref.current;
        if (!el) return;
        const o =
          phase(s.p, range[0], range[0] + 0.025) *
          (1 - phase(s.p, range[1] - 0.025, range[1]));
        el.style.opacity = String(o);
        el.style.transform = `translateY(${(1 - o) * 20}px)`;
      }),
    [range]
  );
  return (
    <div className="beat" ref={ref}>
      <span className="index">{index}</span>
      <h3>{title}</h3>
      <p className="sub">{children}</p>
    </div>
  );
}

/** Word-by-word reveal tied to scroll — the Stripe Press Buffett-quote move. */
function WordReveal({ text, a, b }: { text: string; a: number; b: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const words = useMemo(() => text.split(" "), [text]);
  useEffect(
    () =>
      onScrollChange((s) => {
        const el = ref.current;
        if (!el) return;
        const n = el.children.length;
        for (let i = 0; i < n; i++) {
          const thr = a + (i / Math.max(1, n - 1)) * (b - a);
          const o = clamp01((s.p - thr) / 0.015);
          (el.children[i] as HTMLElement).style.opacity = String(0.12 + 0.88 * o);
        }
      }),
    [a, b]
  );
  return (
    <span ref={ref}>
      {words.map((w, i) => (
        <span key={i}>{w} </span>
      ))}
    </span>
  );
}

/** Heading that chromatically aberrates while the x-ray strains (act 3). */
function StrainHeading({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(
    () =>
      onScrollChange((s) => {
        const el = ref.current;
        if (!el) return;
        const k = cues.strain(s.p);
        el.style.textShadow = `${5 * k}px 0 rgba(255, 40, 40, 0.5), ${-5 * k}px 0 rgba(60, 160, 255, 0.45)`;
      }),
    []
  );
  return <h2 ref={ref}>{children}</h2>;
}

export default function Sections() {
  return (
    <>
      {/* Act 1 — the problem: the naked ledger */}
      <Act range={ACTS.a1} height={HEIGHTS.a1}>
        <p className="kicker">The transparent ledger</p>
        <h1>
          Every transaction
          <br />
          you make is public.
        </h1>
        <p className="sub">
          Balances, counterparties, payroll, strategy &mdash; on a transparent
          chain it is all visible, to everyone, forever.
        </p>
        <TxStream />
      </Act>

      {/* Act 2 — the inversion */}
      <Act range={ACTS.a2} height={HEIGHTS.a2}>
        <p className="kicker">The inversion</p>
        <h2 className="reveal">
          <WordReveal
            a={0.2}
            b={0.32}
            text="Invert the model. Execute locally. Send the chain a proof — not your data."
          />
        </h2>
        <p className="sub">
          Miden moves execution to the edge: transactions run and prove
          themselves on your device. The network verifies the proof. It never
          sees inside.
        </p>
      </Act>

      {/* Act 3 — the x-ray that doesn't work */}
      <Act range={ACTS.a3} height={HEIGHTS.a3}>
        <p className="kicker">Programmable privacy</p>
        <StrainHeading>
          Opaque to everyone.
          <br />
          <span className="accent">Verifiable by anyone.</span>
        </StrainHeading>
        <p className="sub">
          A verifiable record of how computation unfolds &mdash; without
          exposing sensitive inputs or internal state. The proof can be checked
          forever, and it tells you nothing you shouldn&rsquo;t know.
        </p>
      </Act>

      {/* Act 4 — the properties, three beats */}
      <Act range={ACTS.a4} height={HEIGHTS.a4} center>
        <div className="beats">
          <Beat range={[0.615, 0.69]} index="01" title="Customizable privacy">
            Public when you want to be seen. Private when you don&rsquo;t.
            Per-account, per-asset, per-transaction.
          </Beat>
          <Beat range={[0.695, 0.77]} index="02" title="Post-quantum by construction">
            STARK proofs &mdash; hash-based cryptography with no elliptic-curve
            time bomb waiting underneath.
          </Beat>
          <Beat range={[0.775, 0.845]} index="03" title="Scale without a meter">
            When every user proves their own transactions, the chain only
            verifies. Throughput stops being a shared resource.
          </Beat>
        </div>
      </Act>

      {/* Act 5 — the close */}
      <Act range={ACTS.a5} height={HEIGHTS.a5} center>
        <p className="kicker">Miden</p>
        <h2>
          Privacy that
          <br />
          <span className="accent">proves itself.</span>
        </h2>
        <p className="sub centered">
          The programmable privacy network for the next generation of compliant
          finance.
        </p>
        <div className="ctas">
          <a className="btn" href="https://miden.xyz" target="_blank" rel="noreferrer">
            Build on Miden &rarr;
          </a>
          <a
            className="btn ghost"
            href="https://github.com/0xMiden"
            target="_blank"
            rel="noreferrer"
          >
            Read the code
          </a>
        </div>
        <p className="fine">
          Concept study &mdash; unofficial. Structure inspired by the Stripe
          Press <em>Poor Charlie&rsquo;s Almanack</em> teaser.
        </p>
      </Act>
    </>
  );
}
