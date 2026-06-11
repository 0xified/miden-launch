"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { getScrollState } from "@/lib/scroll";
import { cues } from "@/lib/choreo";
import { vertexShader, fragmentShader } from "./shaders";

// Deterministic PRNG so server/client and reload all agree.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const N = 11; // 11^3 = 1331 voxels
const SIDE = 1.55;

export default function VoxelCube() {
  const group = useRef<THREE.Group>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const pSm = useRef(0);

  const { geometry, material } = useMemo(() => {
    const sp = SIDE / (N - 1);
    const count = N * N * N;
    const rnd = mulberry32(1337);

    const home = new Float32Array(count * 3);
    const scatter = new Float32Array(count * 3);
    const field = new Float32Array(count * 3);
    const id = new Float32Array(count);
    const surf = new Float32Array(count);

    const g = 0.22; // field snap grid
    let i = 0;
    for (let x = 0; x < N; x++)
      for (let y = 0; y < N; y++)
        for (let z = 0; z < N; z++) {
          home[i * 3] = (x - (N - 1) / 2) * sp;
          home[i * 3 + 1] = (y - (N - 1) / 2) * sp;
          home[i * 3 + 2] = (z - (N - 1) / 2) * sp;

          // act 1: drifting debris on a wide shell, pushed back from camera
          const r = 2.6 + rnd() * 2.6;
          const th = rnd() * Math.PI * 2;
          const ph = Math.acos(2 * rnd() - 1);
          scatter[i * 3] = r * Math.sin(ph) * Math.cos(th);
          scatter[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.7;
          scatter[i * 3 + 2] = r * Math.cos(ph) * 0.6 - 1.2;

          // act 4: dispersed lattice — random positions snapped to a coarse
          // grid so the spread still reads as intentional structure
          field[i * 3] = Math.round(((rnd() - 0.5) * 5.6) / g) * g;
          field[i * 3 + 1] = Math.round(((rnd() - 0.5) * 3.2) / g) * g;
          field[i * 3 + 2] = Math.round((rnd() * -2.6 - 0.4) / g) * g;

          id[i] = rnd();
          const edge = (k: number) => k === 0 || k === N - 1;
          surf[i] = edge(x) || edge(y) || edge(z) ? 1 : 0;
          i++;
        }

    const box = new THREE.BoxGeometry(sp * 0.62, sp * 0.62, sp * 0.62);
    const geo = new THREE.InstancedBufferGeometry();
    geo.setIndex(box.getIndex());
    geo.setAttribute("position", box.getAttribute("position"));
    geo.setAttribute("normal", box.getAttribute("normal"));
    geo.setAttribute("uv", box.getAttribute("uv"));
    geo.instanceCount = count;
    geo.setAttribute("aHome", new THREE.InstancedBufferAttribute(home, 3));
    geo.setAttribute("aScatter", new THREE.InstancedBufferAttribute(scatter, 3));
    geo.setAttribute("aField", new THREE.InstancedBufferAttribute(field, 3));
    geo.setAttribute("aId", new THREE.InstancedBufferAttribute(id, 1));
    geo.setAttribute("aSurf", new THREE.InstancedBufferAttribute(surf, 1));

    const mat = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uAssemble: { value: 0 },
        uStrain: { value: 0 },
        uLattice: { value: 0 },
        uField: { value: 0 },
        uBreathe: { value: 1 },
        // numeric constructors: raw sRGB values, no colorspace conversion
        uAccent: { value: new THREE.Color(1.0, 0.333, 0.0) },
        uBase: { value: new THREE.Color(0.137, 0.137, 0.149) },
      },
    });

    return { geometry: geo, material: mat };
  }, []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((_, dt) => {
    const s = getScrollState();
    const k = s.reduced ? 1 : Math.min(1, dt * 5);
    pSm.current += (s.p - pSm.current) * k;
    const p = pSm.current;

    const u = material.uniforms;
    u.uTime.value += dt;
    u.uAssemble.value = cues.assemble(p);
    u.uStrain.value = cues.strain(p);
    u.uLattice.value = cues.lattice(p);
    u.uField.value = cues.field(p);
    u.uBreathe.value = s.reduced ? 0 : 1;

    const f = cues.field(p);
    const gr = group.current;
    if (!gr) return;
    const mk = s.reduced ? 1 : Math.min(1, dt * 4);
    // the field faces the camera: scroll-rotation eases off while dispersed
    const targetRY = p * 2.4 * (1 - f) + mouse.current.x * 0.3;
    const targetRX = (0.12 - mouse.current.y * 0.18) * (1 - f * 0.7);
    gr.rotation.y += (targetRY - gr.rotation.y) * mk;
    gr.rotation.x += (targetRX - gr.rotation.x) * mk;
    gr.position.x += (cues.shiftX(p) - gr.position.x) * mk;
    gr.position.z += (-cues.recede(p) - gr.position.z) * mk;
  });

  return (
    <group ref={group}>
      <mesh geometry={geometry} material={material} frustumCulled={false} />
    </group>
  );
}
