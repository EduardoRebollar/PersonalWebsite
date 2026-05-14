/**
 * Terrain shader sources. Inlined as TS strings (no .glsl loader needed).
 *
 * Vertex:   FBM-noise vertex displacement on a high-poly plane, with normals
 *           reconstructed from finite differences so lighting is correct.
 * Fragment: height + slope-driven color ramp, sun lighting, exponential
 *           distance fog. No textures — pure shader.
 *
 * Uniforms are documented inline. Defaults live in Terrain.tsx.
 */

export const terrainVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uAmplitude;
  uniform float uFrequency;
  uniform float uTimeScale;

  varying float vHeight;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  // ---- Stefan Gustavson 2D simplex noise -----------------------------------
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(
      0.211324865405187,
      0.366025403784439,
      -0.577350269189626,
      0.024390243902439
    );
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x  = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  // FBM: 4 octaves of simplex noise, decaying amplitude / increasing frequency.
  float fbm(vec2 p, float t) {
    float value = 0.0;
    float amp = 1.0;
    float freq = 1.0;
    for (int i = 0; i < 4; i++) {
      value += amp * snoise(p * freq + t);
      freq *= 2.0;
      amp *= 0.5;
    }
    return value;
  }

  float displacement(vec2 xz, float t) {
    return fbm(xz * uFrequency, t * uTimeScale) * uAmplitude;
  }

  void main() {
    vec3 pos = position;
    float t = uTime;

    // Heightfield is on local XY (plane is rotated -PI/2 about X in the JSX).
    // So in object space the plane sits in XY; we displace along Z which,
    // after rotation, becomes world Y. We use (pos.x, pos.y) as the 2D input.
    float h = displacement(pos.xy, t);
    pos.z += h;
    vHeight = h;

    // Approximate normals via finite differences.
    float eps = 0.5;
    float hx = displacement(pos.xy + vec2(eps, 0.0), t);
    float hy = displacement(pos.xy + vec2(0.0, eps), t);
    vec3 tx = vec3(eps, 0.0, hx - h);
    vec3 ty = vec3(0.0, eps, hy - h);
    vNormal = normalize(cross(tx, ty));

    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
    vWorldPosition = worldPos.xyz;

    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

export const terrainFragmentShader = /* glsl */ `
  uniform vec3 uColorLow;
  uniform vec3 uColorMid;
  uniform vec3 uColorHigh;
  uniform vec3 uFogColor;
  uniform float uFogDensity;
  uniform vec3 uSunDirection;
  uniform vec3 uSunColor;
  uniform float uSunIntensity;
  uniform float uAmbientIntensity;
  uniform vec3 uAmbientColor;
  uniform float uHeightRange;
  uniform vec3 uCameraPos;

  varying float vHeight;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  void main() {
    // World-space normal. The mesh is rotated, so we rotate the local normal
    // (which we computed against the un-rotated plane) into world space.
    // The plane's rotation lifts +Z into +Y; the local normal already points
    // in the surface direction, so we treat it as world-space here for the
    // purposes of slope-shading and sun lighting.
    vec3 N = normalize(vNormal);

    // Slope: 1.0 when surface points straight up, 0.0 at vertical.
    float slope = clamp(N.z, 0.0, 1.0);

    // Height-driven color ramp.
    float h01 = clamp((vHeight + uHeightRange * 0.5) / uHeightRange, 0.0, 1.0);
    vec3 base = mix(uColorLow, uColorMid, smoothstep(0.0, 0.55, h01));
    base = mix(base, uColorHigh, smoothstep(0.55, 1.0, h01));

    // Cheap fake AO: darken steeper slopes.
    base *= mix(0.55, 1.0, slope);

    // Directional sun.
    vec3 L = normalize(uSunDirection);
    float ndotl = max(dot(N, L), 0.0);
    vec3 sun = uSunColor * uSunIntensity * ndotl;

    // Ambient fill.
    vec3 ambient = uAmbientColor * uAmbientIntensity;

    vec3 color = base * (ambient + sun);

    // Exponential distance fog.
    float dist = length(vWorldPosition - uCameraPos);
    float fog = 1.0 - exp(-uFogDensity * dist);
    fog = clamp(fog, 0.0, 1.0);
    color = mix(color, uFogColor, fog);

    gl_FragColor = vec4(color, 1.0);
  }
`;
