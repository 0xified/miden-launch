"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import Sections from "@/components/Sections";
import Hud from "@/components/Hud";
import { startScroll } from "@/lib/scroll";

const Experience = dynamic(() => import("@/components/Experience"), {
  ssr: false,
});

export default function Page() {
  useEffect(() => {
    startScroll();
  }, []);

  return (
    <>
      <Experience />
      <Hud />
      <main>
        <Sections />
      </main>
      <div className="grain" />
    </>
  );
}
