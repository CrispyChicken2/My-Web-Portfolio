// GLSL ES 3.00 for the Field's three passes: the domain-warped expanse, the
// sparse point layer above it, and the composite that draws both to the screen
// — the composite being where the navigation bar's refraction happens, since
// that is the only place the live Field is available to sample.

export const QUAD_VERT = `#version 300 es
layout(location = 0) in vec2 a_pos;
out vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`

// --- Pass 1: the expanse -----------------------------------------------------

export const EXPANSE_FRAG = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 outColor;

uniform vec2  u_res;
uniform float u_time;
uniform vec2  u_pointer;       // -1..1, smoothed; zero when there is no pointer
uniform float u_pointerAmount; // 0 on touch, 1 on desktop
uniform float u_velocity;      // -1..1, smoothed scroll speed
uniform vec3  u_ink;
uniform vec3  u_deep;
uniform vec3  u_mid;
uniform vec3  u_glow;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// Three octaves is all the expanse needs: what gives it its detail is the
// domain warping below, not the depth of any one fbm. Octaves are the most
// expensive thing in this shader and it runs on every pixel of the screen.
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 rot = mat2(0.80, 0.60, -0.60, 0.80);
  for (int i = 0; i < 3; i++) {
    v += a * noise(p);
    p = rot * p * 2.03;
    a *= 0.5;
  }
  return v;
}

// One more octave, for the layer that is actually read as texture.
float fbm4(vec2 p) {
  return fbm(p) + 0.0625 * noise(p * 8.12 + 19.3);
}

void main() {
  float aspect = u_res.x / max(u_res.y, 1.0);
  vec2 uv = (v_uv - 0.5) * vec2(aspect, 1.0);

  // The cursor is a soft well in the warp: the Field bends toward it and
  // brightens a little. It follows rather than snaps because the value
  // arriving here is already smoothed.
  vec2 cursor = u_pointer * vec2(aspect, 1.0) * 0.5;
  vec2 toCursor = uv - cursor;
  float well = u_pointerAmount * exp(-dot(toCursor, toCursor) * 2.4);

  float t = u_time * 0.045;
  float flow = t + u_velocity * 0.35;

  vec2 p = uv * 1.45;
  p -= normalize(toCursor + vec2(1e-5)) * well * 0.20;
  p.y += u_velocity * 0.12;

  vec2 q = vec2(
    fbm(p + vec2(0.0, flow)),
    fbm(p + vec2(5.2, 1.3) - vec2(flow * 0.7, 0.0))
  );
  vec2 r = vec2(
    fbm(p + 1.7 * q + vec2(1.7, 9.2) + flow * 0.15),
    fbm(p + 1.7 * q + vec2(8.3, 2.8) + flow * 0.13)
  );
  float f = fbm4(p + 1.9 * r);

  vec3 col = mix(u_ink, u_deep, clamp(f * f * 2.3, 0.0, 1.0));
  col = mix(col, u_mid, clamp(length(q) * 0.80, 0.0, 1.0));
  col = mix(col, u_glow, clamp(r.x * r.x * 0.85, 0.0, 1.0));
  col += u_glow * well * 0.10;

  // Grain, so the gradients never band on a dark screen.
  col += (hash(v_uv * u_res + u_time) - 0.5) * 0.024;

  outColor = vec4(col, 1.0);
}`

// --- Pass 2: the point layer -------------------------------------------------

export const POINTS_VERT = `#version 300 es
precision highp float;

uniform vec2  u_res;
uniform float u_time;
uniform vec2  u_pointer;
uniform float u_pointerAmount;
uniform float u_velocity;
uniform float u_scale;
uniform float u_count;

out float v_alpha;

float h11(float n) { return fract(sin(n * 12.9898) * 43758.5453123); }

void main() {
  float id = float(gl_VertexID);
  // Four depths, each drifting and parallaxing by a different amount — which
  // is what reads as points suspended above the expanse rather than on it.
  float depth = 0.25 + floor(mod(id, 4.0)) * 0.25;

  vec2 seed = vec2(h11(id * 1.37), h11(id * 2.71 + 4.1));
  float drift = u_time * (0.003 + depth * 0.009);

  vec2 pos = fract(
    seed
    + vec2(drift * 0.35, drift)
    + u_pointer * u_pointerAmount * depth * 0.022
    + vec2(0.0, u_velocity * depth * 0.030)
  );

  gl_Position = vec4(pos * 2.0 - 1.0, 0.0, 1.0);
  gl_PointSize = max(1.0, (0.7 + depth * 2.0) * u_scale);

  float twinkle = 0.55 + 0.45 * sin(u_time * (0.35 + depth * 0.6) + id);
  v_alpha = (0.10 + depth * 0.42) * twinkle;
}`

export const POINTS_FRAG = `#version 300 es
precision highp float;

in float v_alpha;
out vec4 outColor;

uniform vec3 u_point;

void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.06, d) * v_alpha;
  outColor = vec4(u_point * a, a);
}`

// --- Pass 3: composite, and the navigation bar's refraction ------------------

export const COMPOSITE_FRAG = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 outColor;

uniform sampler2D u_field;
uniform vec2  u_res;
uniform vec4  u_nav;        // x, y, width, height in drawing-buffer pixels
uniform float u_navRadius;
uniform float u_navOn;
uniform vec3  u_ink;
uniform vec3  u_navTint;

float roundedBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

vec3 sampleField(vec2 px) {
  return texture(u_field, clamp(px / u_res, vec2(0.0), vec2(1.0))).rgb;
}

// A handful of taps around the refracted point. Only ever run
// for pixels inside the bar, which is a few thousand of them.
vec3 softSample(vec2 px, float radius) {
  vec3 sum = sampleField(px);
  for (int i = 0; i < 6; i++) {
    float a = float(i) * 1.0472;
    sum += sampleField(px + vec2(cos(a), sin(a)) * radius);
    sum += sampleField(px + vec2(cos(a + 0.5), sin(a + 0.5)) * radius * 0.55);
  }
  return sum / 13.0;
}

void main() {
  vec2 px = v_uv * u_res;
  vec3 col = sampleField(px);

  if (u_navOn > 0.5) {
    vec2 hb = u_nav.zw * 0.5;
    vec2 p = px - (u_nav.xy + hb);
    float d = roundedBox(p, hb, u_navRadius);

    if (d < 0.0) {
      // Gradient of the distance field — the surface normal of the bar's
      // "glass", which is what bends the Field underneath it.
      float e = 1.0;
      vec2 n = normalize(vec2(
        roundedBox(p + vec2(e, 0.0), hb, u_navRadius) - roundedBox(p - vec2(e, 0.0), hb, u_navRadius),
        roundedBox(p + vec2(0.0, e), hb, u_navRadius) - roundedBox(p - vec2(0.0, e), hb, u_navRadius)
      ) + vec2(1e-6));

      // Flat through the middle, steep at the rim — a lens, not a bubble.
      float depth = clamp(-d / 24.0, 0.0, 1.0);
      float bend = pow(1.0 - depth, 2.4);
      vec2 offset = n * bend * 26.0;

      // A touch of dispersion at the rim, where a real edge would show it.
      vec3 base = softSample(px + offset, 3.0);
      vec3 refracted = vec3(
        mix(base.r, sampleField(px + offset * 1.07).r, 0.5),
        base.g,
        mix(base.b, sampleField(px + offset * 0.93).b, 0.5)
      );

      col = mix(refracted, u_navTint, 0.46);

      // Specular rim, brightest along the top edge.
      float rim = smoothstep(3.0, 0.0, abs(d + 1.5));
      col += vec3(0.5) * rim * (0.10 + 0.16 * clamp(n.y, 0.0, 1.0));
      col = mix(col, col * 1.06, smoothstep(0.0, 1.0, depth));
    }
  }

  // Readability scrim: the content layer sits on this, so the Field is dimmed
  // hardest where the page is densest.
  float scrim = mix(0.72, 0.42, v_uv.y);
  col = mix(col, u_ink, scrim);

  // Vignette.
  vec2 c = (v_uv - 0.5) * vec2(u_res.x / max(u_res.y, 1.0), 1.0);
  col = mix(col, u_ink, smoothstep(0.52, 1.20, length(c)) * 0.7);

  outColor = vec4(col, 1.0);
}`
