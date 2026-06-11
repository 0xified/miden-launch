// Custom GLSL for the instanced voxel cube. Positions are computed entirely
// in the vertex shader from per-instance attributes — no instance matrices.
// This is the same trick the Stripe Press teaser uses: scroll drives uniforms,
// per-instance random ids stagger the motion so nothing moves as a rigid sheet.

export const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uAssemble;
uniform float uStrain;
uniform float uField;
uniform float uBreathe;

attribute vec3 aHome;
attribute vec3 aScatter;
attribute vec3 aField;
attribute float aId;
attribute float aSurf;

varying vec3 vNormal;
varying vec3 vView;
varying vec3 vHome;
varying float vId;
varying float vSurf;

float ease(float t) {
  return t * t * (3.0 - 2.0 * t);
}

void main() {
  vId = aId;
  vSurf = aSurf;
  vHome = aHome;

  // staggered assembly: each voxel arrives on its own schedule
  float ta = ease(clamp(uAssemble * 1.7 - aId * 0.7, 0.0, 1.0));
  vec3 p = mix(aScatter, aHome, ta);

  // the failed x-ray: surface voxels strain outward, interior never shows
  vec3 dir = normalize(aHome + vec3(0.0001));
  p += dir * uStrain * (0.04 + 0.28 * aId * aId) * aSurf;

  // dispersal into the field of local provers
  float tf = ease(clamp(uField * 1.7 - aId * 0.7, 0.0, 1.0));
  p = mix(p, aField, tf);

  // idle breathing so the scene never freezes
  p += uBreathe * 0.014 * vec3(
    sin(uTime * 0.70 + aId * 37.0),
    cos(uTime * 0.55 + aId * 51.0),
    sin(uTime * 0.62 + aId * 23.0)
  );

  // voxels shrink while scattered and in the field
  float s = mix(0.55, 1.0, ta) * mix(1.0, 0.42, tf);
  vec3 transformed = position * s + p;

  vec4 mv = modelViewMatrix * vec4(transformed, 1.0);
  vNormal = normalize(normalMatrix * normal);
  vView = -mv.xyz;
  gl_Position = projectionMatrix * mv;
}
`;

export const fragmentShader = /* glsl */ `
uniform float uTime;
uniform float uLattice;
uniform float uStrain;
uniform vec3 uAccent;
uniform vec3 uBase;

varying vec3 vNormal;
varying vec3 vView;
varying vec3 vHome;
varying float vId;
varying float vSurf;

void main() {
  vec3 n = normalize(vNormal);
  vec3 v = normalize(vView);

  float fres = pow(1.0 - abs(dot(n, v)), 2.6);
  float lambert = 0.5 + 0.5 * dot(n, normalize(vec3(0.4, 0.8, 0.55)));
  vec3 col = uBase * (0.35 + 0.65 * lambert);

  // proof lattice: a band of light sweeping the cube surface —
  // the verifiable record, rendered on the outside of an opaque volume
  float band = sin((vHome.x + vHome.y + vHome.z) * 6.0 - uTime * 1.4) * 0.5 + 0.5;
  float lat = uLattice * vSurf * (0.25 + 0.75 * pow(band, 3.0)) * (0.5 + 0.5 * vId);
  col += uAccent * lat * 1.6;

  // strain heat: edges flare while the x-ray fails
  col += uAccent * uStrain * fres * 0.9;
  col += uAccent * fres * 0.12;

  gl_FragColor = vec4(col, 1.0);
}
`;
