"use client";

import { useMemo } from "react";

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const LABELS = [
  "salary",
  "rent",
  "invoice #0392",
  "medical",
  "payroll batch",
  "treasury rebalance",
  "vesting unlock",
  "savings",
  "donation",
  "margin call",
  "severance",
  "acquisition escrow",
];

export default function TxStream() {
  const rows = useMemo(() => {
    const rnd = mulberry32(99);
    const hex = (n: number) =>
      Array.from({ length: n }, () => "0123456789abcdef"[Math.floor(rnd() * 16)]).join("");
    return Array.from({ length: 6 }, () =>
      Array.from({ length: 9 }, () => ({
        from: `0x${hex(4)}…${hex(4)}`,
        to: `0x${hex(4)}…${hex(4)}`,
        label: LABELS[Math.floor(rnd() * LABELS.length)],
        amt: (Math.floor(rnd() * 99000) + 500).toLocaleString("en-US"),
      }))
    );
  }, []);

  return (
    <div className="stream" aria-hidden>
      {rows.map((items, r) => (
        <div className="rowclip" key={r}>
          <div
            className="row"
            style={{
              animationDuration: `${46 + r * 9}s`,
              animationDirection: r % 2 ? "reverse" : "normal",
            }}
          >
            {[...items, ...items].map((t, i) => (
              <span className="tx" key={i}>
                {t.from} <em>&rarr;</em> {t.to} &middot; {t.label} &middot; {t.amt} USDC
                &middot; <b>PUBLIC</b>
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
