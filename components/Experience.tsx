"use client";

import { Canvas } from "@react-three/fiber";
import VoxelCube from "./VoxelCube";

export default function Experience() {
  return (
    <div className="gl" aria-hidden>
      <Canvas
        dpr={[1, 1.75]}
        gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
        camera={{ fov: 42, position: [0, 0, 3.6] }}
        onCreated={({ gl }) => gl.setClearColor("#09090b")}
      >
        <VoxelCube />
      </Canvas>
    </div>
  );
}
