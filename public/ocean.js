/* ocean.js · ים חי לאתר · fx-ocean */
(()=>{var ke=`// \u05E4\u05E0\u05D9 \u05D4\u05D9\u05DD: \u05E1\u05DB\u05D5\u05DD \u05E9\u05DC \u05D2\u05DC\u05D9\u05DD \u05D1\u05DB\u05D9\u05D5\u05D5\u05DF \u05D4\u05E8\u05D5\u05D7. \u05DB\u05DC \u05D2\u05DC \u05D7\u05D3 \u05D1\u05E4\u05E1\u05D2\u05D4 \u05D5\u05E9\u05D8\u05D5\u05D7 \u05D1\u05E9\u05E7\u05E2, \u05D5\u05D2\u05DD \u05D3\u05D5\u05D7\u05E3 \u05E7\u05E6\u05EA \u05D0\u05EA \u05D4\u05D2\u05DC\u05D9\u05DD \u05D4\u05E7\u05D8\u05E0\u05D9\u05DD \u05E9\u05E8\u05D5\u05DB\u05D1\u05D9\u05DD \u05E2\u05DC\u05D9\u05D5.
// p \u05D1\u05DE\u05D8\u05E8\u05D9\u05DD. \u05DE\u05D7\u05D6\u05D9\u05E8 \u05D2\u05D5\u05D1\u05D4 \u05DE\u05E0\u05D5\u05E8\u05DE\u05DC, \u05D1\u05E2\u05E8\u05DA 0.14 \u05E2\u05D3 1.
uniform float uTime;
uniform vec4 uSea;        // x \u05D2\u05D5\u05D1\u05D4 \u05D4\u05D2\u05DC\u05D9\u05DD \u05D1\u05DE\u05D8\u05E8\u05D9\u05DD \xB7 y \u05D7\u05D3\u05D5\u05EA \xB7 z \u05EA\u05D3\u05E8 \u05D4\u05D2\u05DC \u05D4\u05D2\u05D3\u05D5\u05DC \xB7 w \u05DB\u05D9\u05D5\u05D5\u05DF \u05D4\u05E8\u05D5\u05D7

float sea(vec2 p, int n) {
  vec2 q = p * uSea.z;
  float fr = 1.0, w = 1.0, sum = 0.0, h = 0.0;
  for (int i = 0; i < 32; i++) {
    if (i >= n) break;
    float fi = float(i);
    // \u05D2\u05DC\u05D9\u05DD \u05D2\u05D3\u05D5\u05DC\u05D9\u05DD \u05D4\u05D5\u05DC\u05DB\u05D9\u05DD \u05E2\u05DD \u05D4\u05E8\u05D5\u05D7, \u05E7\u05D8\u05E0\u05D9\u05DD \u05DE\u05EA\u05E4\u05D6\u05E8\u05D9\u05DD \u05DC\u05E6\u05D3\u05D3\u05D9\u05DD
    float a = uSea.w + sin(fi * 2.399963 + 0.7) * (0.26 + 0.05 * fi);
    vec2 d = vec2(cos(a), sin(a));
    // \u05D1\u05DE\u05D9\u05DD \u05E2\u05DE\u05D5\u05E7\u05D9\u05DD \u05D2\u05DC \u05D0\u05E8\u05D5\u05DA \u05E0\u05E2 \u05DE\u05D4\u05E8 \u05D9\u05D5\u05EA\u05E8: \u05D4\u05DE\u05D4\u05D9\u05E8\u05D5\u05EA \u05D4\u05D6\u05D5\u05D5\u05D9\u05EA\u05D9\u05EA \u05D4\u05D9\u05D0 \u05E9\u05D5\u05E8\u05E9 \u05E9\u05DC \u05DB\u05D5\u05D7 \u05D4\u05DB\u05D5\u05D1\u05D3 \u05DB\u05E4\u05D5\u05DC \u05DE\u05E1\u05E4\u05E8 \u05D4\u05D2\u05DC
    float x = dot(d, q) * fr - uTime * sqrt(9.81 * uSea.z * fr) + fi * 1.91;
    float e = exp(sin(x) - 1.0);
    q -= d * (e * cos(x)) * w * uSea.y;
    h += e * w;
    sum += w;
    w *= 0.82;
    fr *= 1.18;
  }
  return h / sum;
}
`;var Le=`attribute vec2 p;
uniform vec3 uCam;
varying float vUnder;     // \u05D4\u05DE\u05E6\u05DC\u05DE\u05D4 \u05DE\u05EA\u05D7\u05EA \u05DC\u05E4\u05E0\u05D9 \u05D4\u05DE\u05D9\u05DD?
varying float vSurf;      // \u05D2\u05D5\u05D1\u05D4 \u05E4\u05E0\u05D9 \u05D4\u05DE\u05D9\u05DD \u05D1\u05D3\u05D9\u05D5\u05E7 \u05DE\u05E2\u05DC \u05D4\u05DE\u05E6\u05DC\u05DE\u05D4
//#include sea
void main() {
  float h = sea(uCam.xz, GEO) * uSea.x - uSea.x;
  vSurf = h;
  vUnder = uCam.y < h ? 1.0 : 0.0;
  gl_Position = vec4(p, 0.0, 1.0);
}
`;var Te=`precision highp float;
uniform vec2 uRes;
uniform vec3 uCam;        // \u05DE\u05D9\u05E7\u05D5\u05DD \u05D4\u05DE\u05E6\u05DC\u05DE\u05D4 \u05D1\u05DE\u05D8\u05E8\u05D9\u05DD
uniform vec3 uLook;       // x \u05E1\u05D9\u05D1\u05D5\u05D1 \u05DC\u05E6\u05D3\u05D3\u05D9\u05DD \xB7 y \u05D4\u05D8\u05D9\u05D4 \u05DC\u05DE\u05E2\u05DC\u05D4 \u05D5\u05DC\u05DE\u05D8\u05D4 \xB7 z \u05D0\u05D5\u05E8\u05DA \u05DE\u05D5\u05E7\u05D3
uniform vec3 uSun;        // \u05D4\u05DB\u05D9\u05D5\u05D5\u05DF \u05D0\u05DC \u05D4\u05E9\u05DE\u05E9 (\u05D0\u05D5 \u05D4\u05D9\u05E8\u05D7)
uniform vec3 uSunCol;
uniform vec3 uZen;        // \u05E6\u05D1\u05E2 \u05D4\u05E9\u05DE\u05D9\u05DD \u05DC\u05DE\u05E2\u05DC\u05D4
uniform vec3 uHor;        // \u05E6\u05D1\u05E2 \u05D4\u05E9\u05DE\u05D9\u05DD \u05D1\u05D0\u05D5\u05E4\u05E7
uniform vec3 uDeep;       // \u05E6\u05D1\u05E2 \u05D4\u05DE\u05D9\u05DD \u05D4\u05E2\u05DE\u05D5\u05E7\u05D9\u05DD
uniform vec3 uShal;       // \u05E6\u05D1\u05E2 \u05D4\u05DE\u05D9\u05DD \u05E9\u05D4\u05D0\u05D5\u05E8 \u05E2\u05D5\u05D1\u05E8 \u05D3\u05E8\u05DB\u05DD
uniform vec4 uAir;        // x \u05E2\u05E0\u05E0\u05D9\u05DD \xB7 y \u05E2\u05E8\u05E4\u05DC \xB7 z \u05E7\u05E6\u05E3 \xB7 w \u05DB\u05D5\u05DB\u05D1\u05D9\u05DD
uniform vec4 uFx;         // x \u05D4\u05D1\u05D6\u05E7 \u05D1\u05E8\u05E7 \xB7 y \u05D2\u05E9\u05DD \xB7 z \u05D1\u05D5\u05E2\u05D5\u05EA \xB7 w \u05D9\u05DD \u05D6\u05D5\u05D4\u05E8
uniform vec4 uBolt;       // x \u05DB\u05D9\u05D5\u05D5\u05DF \u05D4\u05D1\u05E8\u05E7 \xB7 y \u05E6\u05D5\u05E8\u05D4 \xB7 z \u05E2\u05D5\u05E6\u05DE\u05D4 \xB7 w \u05D2\u05D5\u05D1\u05D4 \u05D1\u05E1\u05D9\u05E1 \u05D4\u05E2\u05E0\u05E0\u05D9\u05DD
varying float vUnder;
varying float vSurf;
//#include sea

const float LENS = 0.5;   // \u05D2\u05D5\u05D1\u05D4 "\u05D4\u05E2\u05D3\u05E9\u05D4" \u05D1\u05DE\u05D8\u05E8\u05D9\u05DD: \u05D1\u05D6\u05DB\u05D5\u05EA\u05D4 \u05E8\u05D5\u05D0\u05D9\u05DD \u05D7\u05E6\u05D9 \u05DE\u05E2\u05DC \u05D4\u05DE\u05D9\u05DD \u05D5\u05D7\u05E6\u05D9 \u05DE\u05EA\u05D7\u05EA \u05DB\u05E9\u05D4\u05DE\u05E6\u05DC\u05DE\u05D4 \u05E2\u05DC \u05E7\u05D5 \u05D4\u05DE\u05D9\u05DD

float hash(vec2 p) {
  p = mod(p, 289.0);
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.03 + vec2(11.3, 7.7); a *= 0.5; }
  return v;
}

// \u05D4\u05E9\u05DE\u05D9\u05DD: \u05DE\u05E2\u05D1\u05E8 \u05E6\u05D1\u05E2 \u05DE\u05D4\u05D0\u05D5\u05E4\u05E7 \u05DC\u05DE\u05E2\u05DC\u05D4, \u05D4\u05D9\u05DC\u05D4 \u05E1\u05D1\u05D9\u05D1 \u05D4\u05E9\u05DE\u05E9, \u05E2\u05E0\u05E0\u05D9\u05DD, \u05DB\u05D5\u05DB\u05D1\u05D9\u05DD \u05D5\u05D1\u05E8\u05E7\u05D9\u05DD
vec3 sky(vec3 d, float detail) {
  float y = max(d.y, 0.0);
  vec3 c = mix(uHor, uZen, pow(y, 0.42));
  float sd = max(dot(d, uSun), 0.0);
  c += uSunCol * (0.1 * pow(sd, 6.0) + 0.38 * pow(sd, 40.0) + 0.5 * pow(sd, 600.0)) * (1.0 - 0.6 * uAir.x * uAir.x);
  if (detail > 0.5) {
    c += uSunCol * smoothstep(0.99986, 0.99995, dot(d, uSun)) * mix(2.0, 40.0, smoothstep(0.05, 0.4, uSun.y)) * (1.0 - smoothstep(0.6, 0.95, uAir.x));
    if (uAir.w > 0.01) {
      vec2 sp = d.xz / (y + 0.35) * 70.0, id = floor(sp);
      float star = step(0.986, hash(id)) * smoothstep(0.32, 0.04, length(fract(sp) - 0.5));
      c += star * uAir.w * (0.45 + 0.55 * sin(uTime * 1.7 + hash(id + 3.1) * 40.0)) * smoothstep(0.02, 0.3, y);
    }
    if (uBolt.z > 0.01) {
      // \u05D1\u05E8\u05E7: \u05E7\u05D5 \u05E9\u05D1\u05D5\u05E8 \u05DE\u05D1\u05E1\u05D9\u05E1 \u05D4\u05E2\u05E0\u05E0\u05D9\u05DD \u05E2\u05D3 \u05D4\u05D0\u05D5\u05E4\u05E7
      float az = atan(d.x, d.z), el = asin(clamp(d.y, -1.0, 1.0));
      float x = uBolt.x + (noise(vec2(el * 70.0, uBolt.y)) - 0.5) * 0.022 + (noise(vec2(el * 16.0, uBolt.y + 7.0)) - 0.5) * 0.06;
      float dx = abs(az - x), on = step(0.0, el) * smoothstep(uBolt.w, uBolt.w - 0.02, el);
      c += vec3(0.85, 0.9, 1.0) * (smoothstep(0.0045, 0.0, dx) * 9.0 + exp(-dx * 55.0) * 0.8) * on * uBolt.z;
    }
  }
  c += vec3(0.45, 0.5, 0.66) * uFx.x * (0.25 + 0.75 * smoothstep(0.0, 0.5, y));
  if (uAir.x > 0.01) {
    vec2 cp = d.xz / (y + 0.16) * 0.5 + uTime * vec2(0.007, 0.002);
    float w = fbm(cp * 2.1 + 3.0) * 0.7;
    float cl = fbm(cp + w);
    float lo = 0.68 - uAir.x * 0.4;
    float m = smoothstep(lo, lo + 0.2 + uAir.x * 0.1, cl) * smoothstep(0.0, 0.16, y);
    float shade = 0.55;
    if (detail > 0.5) {
      // \u05D4\u05E6\u05D3 \u05E9\u05DC \u05D4\u05E2\u05E0\u05DF \u05E9\u05E4\u05D5\u05E0\u05D4 \u05DC\u05E9\u05DE\u05E9 \u05D1\u05D4\u05D9\u05E8, \u05D4\u05E6\u05D3 \u05D4\u05E9\u05E0\u05D9 \u05DB\u05D4\u05D4
      float cl2 = fbm(cp + w + normalize(uSun.xz + 0.0001) * 0.1);
      shade = clamp((cl - cl2) * 3.4 + 0.5, 0.0, 1.0);
    }
    // \u05D4\u05E2\u05E0\u05E0\u05D9\u05DD \u05DE\u05E7\u05D1\u05DC\u05D9\u05DD \u05D0\u05D5\u05E8 \u05DE\u05D4\u05E9\u05DE\u05D9\u05DD \u05E1\u05D1\u05D9\u05D1\u05DD \u05D5\u05DE\u05D4\u05E9\u05DE\u05E9, \u05DB\u05DA \u05E9\u05D1\u05DC\u05D9\u05DC\u05D4 \u05D4\u05DD \u05DB\u05D4\u05D9\u05DD \u05D5\u05D1\u05E9\u05E7\u05D9\u05E2\u05D4 \u05DB\u05EA\u05D5\u05DE\u05D9\u05DD
    vec3 amb = (uHor + uZen) * 0.5;
    amb = mix(amb, vec3(dot(amb, vec3(0.3, 0.59, 0.11))), 0.6) * 1.3;
    vec3 lit = amb * (0.8 + 0.4 * shade) + uSunCol * (0.25 + 0.6 * pow(sd, 3.0)) * (0.3 + 0.7 * shade);
    lit = lit * (1.1 - uAir.x * 0.3) + vec3(0.8, 0.85, 1.0) * uFx.x * (0.8 + shade);
    c = mix(c, lit, m * 0.92);
  }
  return c;
}

vec3 seaNormal(vec2 p, float e) {
  float h0 = sea(p, NRM), hx = sea(p + vec2(e, 0.0), NRM), hz = sea(p + vec2(0.0, e), NRM);
  return normalize(vec3((h0 - hx) * uSea.x, e, (h0 - hz) * uSea.x));
}

// \u05D7\u05DC\u05E7\u05D9\u05E7\u05D9\u05DD \u05E9\u05DE\u05E8\u05D7\u05E4\u05D9\u05DD \u05D1\u05DE\u05D9\u05DD. \u05DB\u05DE\u05D4 \u05E9\u05DB\u05D1\u05D5\u05EA \u05D1\u05E2\u05D5\u05DE\u05E7\u05D9\u05DD \u05E9\u05D5\u05E0\u05D9\u05DD, \u05E9\u05D6\u05D6\u05D5\u05EA \u05DB\u05E9\u05D4\u05DE\u05E6\u05DC\u05DE\u05D4 \u05E6\u05D5\u05DC\u05DC\u05EA
float specks(vec2 uv, float fall) {
  float s = 0.0;
  for (int l = 0; l < 3; l++) {
    float fl = float(l), sc = 9.0 + fl * 8.0;
    vec2 g = uv * sc + vec2(uTime * 0.03 * (fl + 1.0) + uLook.x * sc * 0.6, fall * (0.25 + 0.2 * fl) + uTime * 0.02), id = floor(g);
    vec2 r = vec2(hash(id + fl * 17.0), hash(id + fl * 17.0 + 5.3));
    float dd = length(fract(g) - 0.5 - (r - 0.5) * 0.7);
    s += smoothstep(0.07 - fl * 0.012, 0.0, dd) * (0.25 + 0.75 * r.x) * (0.6 + 0.4 * sin(uTime * (0.6 + r.y) + r.x * 30.0));
  }
  return s;
}

// \u05D1\u05D5\u05E2\u05D5\u05EA \u05E9\u05E2\u05D5\u05DC\u05D5\u05EA \u05DB\u05E9\u05E6\u05D5\u05DC\u05DC\u05D9\u05DD
float bubbles(vec2 uv) {
  float b = 0.0;
  for (int l = 0; l < 3; l++) {
    float fl = float(l), sc = 3.2 + fl * 4.0;
    vec2 g = uv * sc + vec2(fl * 3.7, -uTime * (0.8 + fl * 0.45));
    vec2 id = floor(g), f = fract(g) - 0.5;
    float h = hash(id + fl * 19.0);
    vec2 c = (vec2(hash(id + 2.1 + fl), hash(id + 5.7 + fl)) - 0.5) * 0.45;
    c.x += sin(uTime * 3.0 + h * 40.0) * 0.07;
    float r = 0.05 + 0.11 * hash(id + 9.3);
    float dd = length(f - c);
    float disc = smoothstep(r, r - 0.02, dd);
    float rim = smoothstep(r - 0.045, r - 0.008, dd) * disc;
    float hi = smoothstep(r * 0.35, 0.0, length(f - c - vec2(-r, r) * 0.38));
    b += step(0.62 + fl * 0.08, h) * (disc * 0.12 + rim * 0.75 + hi);
  }
  return b;
}

// \u05D8\u05D9\u05E4\u05D5\u05EA \u05D2\u05E9\u05DD \u05E9\u05E0\u05D5\u05E4\u05DC\u05D5\u05EA \u05DE\u05D5\u05DC \u05D4\u05E2\u05D3\u05E9\u05D4
float rain(vec2 uv) {
  float s = 0.0;
  for (int l = 0; l < 2; l++) {
    float fl = float(l);
    vec2 q = vec2((uv.x + uv.y * 0.2) * (46.0 + fl * 38.0), uv.y * (5.0 + fl * 3.0) + uTime * (8.0 + fl * 4.0));
    float col = floor(q.x), h = hash(vec2(col, 3.0 + fl));
    float y = fract(q.y + h * 13.0);
    float on = step(0.55, hash(vec2(col + fl * 50.0, floor(q.y + h * 13.0))));
    s += on * smoothstep(0.16, 0.0, abs(fract(q.x) - 0.5)) * smoothstep(0.0, 0.05, y) * smoothstep(0.34, 0.08, y) * (0.6 - fl * 0.25);
  }
  return s;
}

vec3 tone(vec3 c) {
  c = c * (2.51 * c + 0.03) / (c * (2.43 * c + 0.59) + 0.14);
  return pow(clamp(c, 0.0, 1.0), vec3(1.0 / 2.2));
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  float cy = cos(uLook.x), sy = sin(uLook.x), cp = cos(uLook.y), sp = sin(uLook.y);
  vec3 fw = vec3(sy * cp, sp, cy * cp);
  vec3 rt = normalize(cross(vec3(0.0, 1.0, 0.0), fw));
  vec3 up = cross(fw, rt);
  vec3 d = normalize(fw * uLook.z + rt * uv.x + up * uv.y);
  vec3 o = uCam + (rt * uv.x + up * uv.y) * LENS;          // \u05DB\u05DC \u05E4\u05D9\u05E7\u05E1\u05DC \u05D9\u05D5\u05E6\u05D0 \u05DE\u05E0\u05E7\u05D5\u05D3\u05D4 \u05D0\u05D7\u05E8\u05EA \u05E2\u05DC \u05D4\u05E2\u05D3\u05E9\u05D4
  float D = uSea.x;
  // \u05D4\u05D0\u05DD \u05D4\u05E0\u05E7\u05D5\u05D3\u05D4 \u05D4\u05D6\u05D0\u05EA \u05E2\u05DC \u05D4\u05E2\u05D3\u05E9\u05D4 \u05DE\u05EA\u05D7\u05EA \u05DC\u05DE\u05D9\u05DD? \u05E7\u05E8\u05D5\u05D1 \u05DC\u05E4\u05E0\u05D9 \u05D4\u05DE\u05D9\u05DD \u05D1\u05D5\u05D3\u05E7\u05D9\u05DD \u05DC\u05DB\u05DC \u05E4\u05D9\u05E7\u05E1\u05DC, \u05D5\u05DB\u05DA \u05E0\u05D5\u05E6\u05E8 \u05E7\u05D5 \u05DE\u05D9\u05DD \u05E9\u05E0\u05E2 \u05E2\u05DC \u05D4\u05DE\u05E1\u05DA
  float surfHere = vSurf, under = vUnder;
  if (abs(uCam.y - vSurf) < LENS * 1.3) {
    surfHere = sea(o.xz, GEO) * D - D;
    under = o.y < surfHere ? 1.0 : 0.0;
  }
  vec3 col;

  if (under < 0.5) {
    // ---------- \u05DE\u05E2\u05DC \u05D4\u05DE\u05D9\u05DD
    bool hit = false;
    float t = 0.0;
    if (d.y < -0.0006 || o.y < 0.0) {
      // \u05E6\u05D5\u05E2\u05D3\u05D9\u05DD \u05DC\u05D0\u05D5\u05E8\u05DA \u05E7\u05E8\u05DF \u05D4\u05DE\u05D1\u05D8 \u05E2\u05D3 \u05E9\u05E4\u05D5\u05D2\u05E2\u05D9\u05DD \u05D1\u05E4\u05E0\u05D9 \u05D4\u05DE\u05D9\u05DD
      if (o.y > 0.0) t = -o.y / d.y;
      hit = d.y < -0.0006;
      for (int i = 0; i < STEPS; i++) {
        vec3 q = o + d * t;
        if (d.y > 0.0 && q.y > 0.0) { hit = false; break; }        // \u05D4\u05E7\u05E8\u05DF \u05E2\u05DC\u05EA\u05D4 \u05DE\u05E2\u05DC \u05D4\u05D2\u05DC \u05D4\u05D2\u05D1\u05D5\u05D4 \u05D1\u05D9\u05D5\u05EA\u05E8
        float gap = q.y - (sea(q.xz, GEO) * D - D);
        if (gap < 0.002 + t * 0.0012) { hit = true; break; }
        t += gap;
      }
    }
    if (!hit) {
      col = sky(d, 1.0);
    } else {
      vec3 p = o + d * t;
      vec3 N = seaNormal(p.xz, 0.012 + t * 0.004);
      N = normalize(mix(N, vec3(0.0, 1.0, 0.0), smoothstep(25.0, 900.0, t) * 0.93));     // \u05E8\u05D7\u05D5\u05E7 \u05DE\u05D0\u05D5\u05D3 \u05D4\u05D2\u05DC\u05D9\u05DD \u05E7\u05D8\u05E0\u05D9\u05DD \u05DE\u05E4\u05D9\u05E7\u05E1\u05DC
      float F = 0.02 + 0.98 * pow(1.0 - max(dot(N, -d), 0.0), 5.0);                     // \u05D1\u05DE\u05D1\u05D8 \u05E9\u05D8\u05D5\u05D7 \u05D4\u05DE\u05D9\u05DD \u05D4\u05DD \u05DE\u05E8\u05D0\u05D4
      vec3 R = reflect(d, N);
      R.y = abs(R.y);
      float sr = max(dot(R, uSun), 0.0);
      // \u05E0\u05E6\u05E0\u05D5\u05E6\u05D9 \u05E9\u05DE\u05E9: \u05E7\u05E8\u05D5\u05D1 \u05DC\u05DE\u05E6\u05DC\u05DE\u05D4 \u05D4\u05D4\u05E9\u05EA\u05E7\u05E4\u05D5\u05EA \u05E0\u05E9\u05D1\u05E8\u05EA \u05DC\u05D4\u05E8\u05D1\u05D4 \u05E0\u05E7\u05D5\u05D3\u05D5\u05EA \u05D0\u05D5\u05E8 \u05E7\u05D8\u05E0\u05D5\u05EA
      float gl = noise(p.xz * 61.0 + uTime * vec2(1.3, -0.9)) * noise(p.xz * 147.0 - uTime * vec2(0.8, 1.6));
      float sparkle = mix(smoothstep(0.34, 0.6, gl) * 9.0, 1.0, smoothstep(3.0, 26.0, t));
      float clear = 1.0 - 0.75 * uAir.x * uAir.x;
      vec3 refl = sky(R, 0.0) + uSunCol * (pow(sr, 800.0) * 26.0 * (0.25 + 0.75 * sparkle) + pow(sr, 80.0) * 1.3 * sparkle) * clear;
      float hn = clamp((p.y + D) / D, 0.0, 1.0);                                       // 0 \u05D1\u05E9\u05E7\u05E2, 1 \u05D1\u05E4\u05E1\u05D2\u05D4
      float through = pow(max(dot(d, uSun) * 0.5 + 0.5, 0.0), 4.0);                     // \u05DE\u05D5\u05DC \u05D4\u05E9\u05DE\u05E9 \u05D4\u05D0\u05D5\u05E8 \u05E2\u05D5\u05D1\u05E8 \u05D3\u05E8\u05DA \u05D4\u05E4\u05E1\u05D2\u05D5\u05EA
      float lightUp = 0.3 + 0.9 * max(uSun.y, 0.0);
      vec3 body = mix(uDeep, uShal, hn * hn * (0.3 + 0.7 * through)) * lightUp + uShal * uSunCol * through * hn * 0.22;
      body += uShal * uFx.x * 0.35;
      col = mix(body, refl, F);
      // \u05E7\u05E6\u05E3 \u05E2\u05DC \u05E4\u05E1\u05D2\u05D5\u05EA \u05D2\u05D1\u05D5\u05D4\u05D5\u05EA \u05D5\u05EA\u05DC\u05D5\u05DC\u05D5\u05EA. \u05D1\u05DC\u05D9\u05DC\u05D4 \u05D4\u05E7\u05E6\u05E3 \u05D6\u05D5\u05D4\u05E8 \u05D1\u05DB\u05D7\u05D5\u05DC, \u05DB\u05DE\u05D5 \u05E4\u05DC\u05E0\u05E7\u05D8\u05D5\u05DF
      float thr = mix(0.9, 0.6, uAir.z);
      float foam = smoothstep(thr, thr + 0.13, hn + (1.0 - N.y) * 0.7);
      foam *= smoothstep(0.3, 0.68, fbm(p.xz * 2.4 + uTime * 0.1)) * (1.0 - smoothstep(60.0, 320.0, t));
      col = mix(col, (uHor * 0.45 + uSunCol * 0.5 + 0.2) * vec3(0.95, 0.98, 1.0), foam * (1.0 - uFx.w));
      if (uFx.w > 0.01) {
        // \u05E4\u05DC\u05E0\u05E7\u05D8\u05D5\u05DF \u05D6\u05D5\u05D4\u05E8: \u05E0\u05E7\u05D5\u05D3\u05D5\u05EA \u05D0\u05D5\u05E8 \u05DB\u05D7\u05D5\u05DC\u05D5\u05EA \u05D1\u05E4\u05E1\u05D2\u05D5\u05EA \u05E9\u05E0\u05E9\u05D1\u05E8\u05D5\u05EA
        float crest = smoothstep(0.7, 0.95, hn + (1.0 - N.y) * 0.8) * smoothstep(1.5, 7.0, t) * (1.0 - smoothstep(30.0, 160.0, t));
        float patch = smoothstep(0.42, 0.75, fbm(p.xz * 1.3 + uTime * 0.07));
        float spark = 0.35 + 1.6 * smoothstep(0.55, 0.95, noise(p.xz * 13.0 + uTime * vec2(0.9, -0.6)));
        col += vec3(0.08, 0.68, 1.0) * crest * patch * spark * 0.9 * uFx.w;
      }
      // \u05D0\u05D5\u05D5\u05D9\u05E8: \u05E8\u05D7\u05D5\u05E7 \u05D9\u05D5\u05EA\u05E8, \u05D3\u05D5\u05DE\u05D4 \u05D9\u05D5\u05EA\u05E8 \u05DC\u05E6\u05D1\u05E2 \u05D4\u05D0\u05D5\u05E4\u05E7
      col = mix(col, sky(normalize(vec3(d.x, 0.015, d.z)), 0.0), 1.0 - exp(-t * uAir.y));
    }
    if (uFx.y > 0.01) col = mix(col, vec3(0.72, 0.77, 0.82) * (0.55 + uFx.x * 1.5), clamp(rain(uv), 0.0, 1.0) * 0.3 * uFx.y);
  } else {
    // ---------- \u05DE\u05EA\u05D7\u05EA \u05DC\u05DE\u05D9\u05DD
    float depth = max(0.0, vSurf - o.y);                    // \u05DB\u05DE\u05D4 \u05DE\u05D8\u05E8\u05D9\u05DD \u05DE\u05E2\u05DC\u05D9\u05E0\u05D5
    float left = exp(-depth * 0.024);                       // \u05DB\u05DE\u05D4 \u05D0\u05D5\u05E8 \u05E0\u05E9\u05D0\u05E8 \u05D1\u05E2\u05D5\u05DE\u05E7 \u05D4\u05D6\u05D4
    float day = 0.2 + 0.8 * max(uSun.y, 0.08) + 0.25 * length(uSunCol);
    vec3 tint = mix(uShal, vec3(0.03, 0.3, 0.42) * (0.35 + 0.65 * length(uShal)), 0.55);      // \u05DE\u05EA\u05D7\u05EA \u05DC\u05DE\u05D9\u05DD \u05D4\u05E6\u05D1\u05E2 \u05DB\u05D7\u05D5\u05DC \u05D9\u05D5\u05EA\u05E8, \u05D1\u05DB\u05DC \u05E9\u05E2\u05D4
    tint = mix(tint, vec3(0.01, 0.13, 0.36) * (0.4 + 0.6 * length(uShal)), smoothstep(0.0, 0.75, 1.0 - left));   // \u05D1\u05E2\u05D5\u05DE\u05E7 \u05D4\u05D0\u05D3\u05D5\u05DD \u05E0\u05D1\u05DC\u05E2 \u05E8\u05D0\u05E9\u05D5\u05DF
    vec3 water = ((uDeep * 0.5 + tint * 0.5 * left) * left + uDeep * 0.05) * day * (0.5 + 0.7 * smoothstep(-0.7, 0.9, d.y));
    water += tint * uFx.x * 0.25 * left;
    col = water;
    // \u05D4\u05DB\u05D9\u05D5\u05D5\u05DF \u05E9\u05D1\u05D5 \u05D4\u05E9\u05DE\u05E9 \u05E0\u05E8\u05D0\u05D9\u05EA \u05DE\u05EA\u05D7\u05EA \u05DC\u05DE\u05D9\u05DD
    vec3 L = normalize(vec3(uSun.x / 1.333, sqrt(max(0.05, 1.0 - (1.0 - uSun.y * uSun.y) / 1.777)), uSun.z / 1.333));
    if (d.y > 0.03) {
      // \u05DE\u05E1\u05EA\u05DB\u05DC\u05D9\u05DD \u05DC\u05DE\u05E2\u05DC\u05D4: \u05E4\u05E0\u05D9 \u05D4\u05DE\u05D9\u05DD \u05DE\u05DC\u05DE\u05D8\u05D4
      float t = max(0.0, (-D - o.y) / d.y);
      for (int i = 0; i < STEPS; i++) {
        vec3 q = o + d * t;
        float gap = (sea(q.xz, GEO) * D - D) - q.y;
        if (gap < 0.003 + t * 0.002) break;
        t += gap * 0.9;
      }
      vec3 p = o + d * t;
      vec3 N = seaNormal(p.xz, 0.02 + t * 0.006);
      // \u05D4\u05E7\u05E8\u05DF \u05D9\u05D5\u05E6\u05D0\u05EA \u05DE\u05D4\u05DE\u05D9\u05DD \u05DC\u05D0\u05D5\u05D5\u05D9\u05E8 \u05D5\u05E0\u05E9\u05D1\u05E8\u05EA. \u05DE\u05E2\u05D1\u05E8 \u05DC\u05D6\u05D5\u05D5\u05D9\u05EA \u05DE\u05E1\u05D5\u05D9\u05DE\u05EA \u05D4\u05D9\u05D0 \u05DC\u05D0 \u05D9\u05D5\u05E6\u05D0\u05EA \u05D1\u05DB\u05DC\u05DC, \u05D5\u05E8\u05D5\u05D0\u05D9\u05DD \u05E8\u05E7 \u05D0\u05EA \u05D4\u05D7\u05D5\u05E9\u05DA \u05DE\u05E9\u05EA\u05E7\u05E3
      float ci = max(dot(d, N), 0.0), k = 1.0 - 1.777 * (1.0 - ci * ci);
      vec3 T = normalize(1.333 * d - (1.333 * ci - sqrt(max(k, 0.0))) * N + vec3(0.0, 0.02, 0.0));
      float window = smoothstep(-0.05, 0.3, k) * smoothstep(0.04, 0.3, d.y);   // \u05E7\u05E6\u05D4 \u05E8\u05DA \u05DC"\u05D7\u05DC\u05D5\u05DF" \u05E9\u05D3\u05E8\u05DB\u05D5 \u05E8\u05D5\u05D0\u05D9\u05DD \u05D0\u05EA \u05D4\u05E9\u05DE\u05D9\u05DD
      float ripple = clamp(1.0 + dot(N.xz, L.xz) * 3.2 - (1.0 - N.y) * 1.5, 0.5, 1.7);   // \u05D4\u05D2\u05DC\u05D9\u05DD \u05DE\u05E8\u05DB\u05D6\u05D9\u05DD \u05D5\u05DE\u05E4\u05D6\u05E8\u05D9\u05DD \u05D0\u05EA \u05D4\u05D0\u05D5\u05E8
      vec3 surf = mix(water * 0.55, sky(T, 0.0) * 0.95 * ripple, window);
      col = mix(water, surf, exp(-t * (0.07 + 0.03 * (1.0 - left))));
    }
    // \u05E7\u05E8\u05E0\u05D9 \u05D0\u05D5\u05E8 \u05E9\u05D9\u05D5\u05E8\u05D3\u05D5\u05EA \u05DE\u05E4\u05E0\u05D9 \u05D4\u05DE\u05D9\u05DD
    vec3 sunTone = mix(uSunCol, vec3(length(uSunCol) * 0.6), 0.45) * (1.0 - 0.6 * uAir.x * uAir.x);
    vec3 b1 = normalize(cross(L, vec3(0.31, 0.0, 0.95))), b2 = cross(L, b1);
    vec2 v = vec2(dot(d, b1), dot(d, b2));
    float rad = length(v);
    vec2 c2 = v / max(rad, 0.001);
    float shaft = noise(c2 * 3.1 + vec2(uTime * 0.07, uTime * 0.03)) * 0.55
                + noise(c2 * 7.7 - vec2(uTime * 0.05, uTime * 0.08) + 4.0) * 0.3
                + noise(c2 * 21.0 + uTime * 0.06 + 8.0) * 0.15;
    float ray = smoothstep(0.46, 0.7, shaft) * smoothstep(-0.2, 0.75, dot(d, L)) * smoothstep(0.0, 0.1, rad);
    ray *= 0.6 + 0.4 * noise(c2 * 3.0 + rad * 2.4 - uTime * 0.22);
    float strength = 1.2 * (0.3 + 0.9 * smoothstep(0.0, 0.5, uSun.y));
    col += (tint + 0.1) * sunTone * (ray * left * left * strength + pow(max(dot(d, L), 0.0), 8.0) * 0.45 * left);
    // \u05D7\u05DC\u05E7\u05D9\u05E7\u05D9\u05DD, \u05D5\u05D1\u05E2\u05D5\u05DE\u05E7 \u05D2\u05D3\u05D5\u05DC \u05E0\u05E7\u05D5\u05D3\u05D5\u05EA \u05D0\u05D5\u05E8 \u05DB\u05D7\u05DC\u05D7\u05DC\u05D5\u05EA
    float sn = specks(uv, o.y);
    col += vec3(0.75, 0.92, 1.0) * sn * (0.1 + 0.5 * left) * day;
    col += vec3(0.1, 0.85, 1.0) * sn * sn * (1.0 - left) * 0.9;
    if (uFx.z > 0.01) col += mix(vec3(0.8, 0.93, 1.0), tint + 0.4, 0.3) * bubbles(uv) * uFx.z * (0.25 + 0.75 * left) * day * 0.8;
  }
  // \u05E7\u05D5 \u05D4\u05DE\u05D9\u05DD \u05E2\u05DC \u05D4\u05E2\u05D3\u05E9\u05D4: \u05E4\u05E1 \u05D1\u05D4\u05D9\u05E8 \u05D3\u05E7, \u05D5\u05DE\u05EA\u05D7\u05EA\u05D9\u05D5 \u05D4\u05DE\u05D9\u05DD \u05DB\u05D4\u05D9\u05DD \u05DE\u05E2\u05D8
  float wl = o.y - surfHere;
  col *= 1.0 - 0.38 * smoothstep(-0.075, -0.004, wl) * step(wl, 0.0);
  col = mix(col, uHor * 0.5 + uShal + 0.32, smoothstep(0.0075, 0.0015, abs(wl)) * 0.8);
  col = tone(col) + (hash(gl_FragCoord.xy + fract(uTime) * 61.0) - 0.5) / 160.0;        // \u05D2\u05E8\u05E2\u05D9\u05DF \u05E2\u05D3\u05D9\u05DF \u05E9\u05DE\u05D5\u05E0\u05E2 \u05E4\u05E1\u05D9\u05DD \u05D1\u05DE\u05E2\u05D1\u05E8\u05D9 \u05E6\u05D1\u05E2 \u05DB\u05D4\u05D9\u05DD
  gl_FragColor = vec4(col, 1.0);
}
`;var _e=`.fx-ocean { position: relative; display: block; background: #04121f; color: #fff; isolation: isolate; }
.fx-ocean__stage { position: sticky; top: 0; z-index: 0; height: 100vh; height: 100lvh; margin-bottom: -100vh; margin-bottom: -100lvh; overflow: hidden; background: #04121f; }
.fx-ocean__stage.is-manual { position: absolute; top: 0; left: 0; right: 0; margin: 0; will-change: transform; }
.fx-ocean__stage canvas { display: block; width: 100%; height: 100%; opacity: 0; transition: opacity 1s ease; }
.fx-ocean.is-ready .fx-ocean__stage canvas { opacity: 1; }
.fx-ocean__veil { position: absolute; inset: 0; background: #04121f; opacity: 0; pointer-events: none; transition: opacity .16s linear; }
.fx-ocean__veil.is-cut { opacity: 1; }
.fx-ocean__stop { position: relative; z-index: 1; box-sizing: border-box; min-height: 100vh; min-height: 100lvh; display: flex; flex-direction: column; justify-content: center; padding: clamp(5rem, 14vh, 9rem) clamp(1.25rem, 6vw, 5rem); pointer-events: none; }
.fx-ocean__stop > * { pointer-events: auto; }
.fx-ocean--solo { display: grid; }
.fx-ocean--solo > * { grid-area: 1 / 1; position: relative; z-index: 1; }
.fx-ocean--solo > .fx-ocean__stage { position: relative; z-index: 0; margin: 0; height: var(--fx-ocean-height, 100vh); }
/* \u05D1\u05DC\u05D9 WebGL: \u05E9\u05DE\u05D9\u05DD \u05D5\u05D9\u05DD \u05DE\u05E6\u05D5\u05D9\u05E8\u05D9\u05DD, \u05D5\u05D4\u05EA\u05D5\u05DB\u05DF \u05E0\u05E9\u05D0\u05E8 \u05E7\u05E8\u05D9\u05D0 */
.fx-ocean--flat .fx-ocean__stage { background: linear-gradient(#1b2a5c 0, #c9684a 38%, #f6b06a 47.6%, #0d3a55 48%, #072436 70%, #04121f 100%); }
.fx-ocean--flat[data-mood="day"] .fx-ocean__stage { background: linear-gradient(#2f6fc0 0, #a9cdee 47.6%, #0f5a78 48%, #08304a 75%, #04121f 100%); }
.fx-ocean--flat[data-mood="night"] .fx-ocean__stage { background: linear-gradient(#020510 0, #0b1630 47.6%, #061a2c 48%, #020810 100%); }
.fx-ocean--flat .fx-ocean__stage canvas { display: none; }
@media (prefers-reduced-motion: reduce) { .fx-ocean__stage canvas { transition: none; } }
`;var k={day:{el:36,az:20,sun:[1,.96,.9],power:1.15,zen:[.04,.2,.58],hor:[.5,.72,.92],deep:[.006,.07,.14],shal:[.04,.42,.48],wave:1,chop:.34,cloud:.3,fog:5e-4,foam:.4,stars:0,rain:0,bolt:0,glow:0},sunset:{el:5.5,az:0,sun:[1,.5,.2],power:1.4,zen:[.05,.08,.27],hor:[1,.42,.16],deep:[.01,.035,.08],shal:[.18,.3,.3],wave:.9,chop:.32,cloud:.6,fog:7e-4,foam:.3,stars:0,rain:0,bolt:0,glow:0},night:{el:24,az:-14,sun:[.62,.72,1],power:.32,zen:[.004,.008,.025],hor:[.025,.045,.09],deep:[.001,.008,.02],shal:[.01,.05,.09],wave:.85,chop:.3,cloud:.3,fog:6e-4,foam:.2,stars:1,rain:0,bolt:0,glow:1},storm:{el:16,az:25,sun:[.75,.8,.85],power:.32,zen:[.05,.065,.08],hor:[.24,.27,.3],deep:[.008,.035,.045],shal:[.09,.18,.19],wave:3.2,chop:.42,cloud:1,fog:.003,foam:1,stars:0,rain:.8,bolt:1,glow:0}},Ee=t=>[t.el,t.az,...t.sun,t.power,...t.zen,...t.hor,...t.deep,...t.shal,t.wave,t.chop,t.cloud,t.fog,t.foam,t.stars,t.rain,t.bolt,t.glow],U={high:{scale:.72,dpr:1.5,steps:44,geo:12,nrm:30},mid:{scale:.5,dpr:1.25,steps:32,geo:10,nrm:22},low:{scale:.34,dpr:1,steps:22,geo:8,nrm:14}},Fe=["low","mid","high"],R=Math.PI/180,g=(t,s,i)=>Math.min(i,Math.max(s,t)),Xe=t=>t*t*(3-2*t),Ye=()=>!!(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches),Re=t=>t>=0?-5:t>-10?24:12;function Ze(){if(document.getElementById("fx-ocean-css"))return;let t=document.createElement("style");t.id="fx-ocean-css",t.textContent=_e,document.head.insertBefore(t,document.head.firstChild)}function Qe(t){if(U[t])return t;let s=window.matchMedia("(hover: none), (pointer: coarse)").matches,i=Math.min(window.screen.width,window.screen.height)<820,c=navigator.deviceMemory&&navigator.deviceMemory<=4||navigator.hardwareConcurrency&&navigator.hardwareConcurrency<=4;return s&&i?c?"low":"mid":c?"mid":"high"}function Ce(t,s){let i=O=>{let o=parseFloat(t.getAttribute(O));return isNaN(o)?null:o},c=i("data-level");c==null&&i("data-depth")!=null&&(c=-Math.abs(i("data-depth"))),c==null&&i("data-height")!=null&&(c=Math.abs(i("data-height"))),c==null&&(c=s?s.level:3.2);let h=i("data-pitch"),L=i("data-turn"),y=i("data-fov"),w=t.getAttribute("data-mood");return{level:c,pitch:h!=null?h:Re(c),turn:L!=null?L:0,fov:y!=null?y:0,mood:k[w]?w:null}}function $e(t){Ze();let s=Ye(),i=Array.from(t.children).filter(e=>e.classList.contains("fx-ocean__stop")).map(e=>({el:e,view:null}));i.forEach((e,a)=>{e.view=Ce(e.el,a?i[a-1].view:null)}),i.length||t.classList.add("fx-ocean--solo");let c=document.createElement("div");c.className="fx-ocean__stage";let h=document.createElement("canvas");h.setAttribute("aria-hidden","true");let L=document.createElement("div");L.className="fx-ocean__veil",c.append(h,L),t.insertBefore(c,t.firstChild),k[t.getAttribute("data-mood")]||t.setAttribute("data-mood","sunset");let y=t.getAttribute("data-mood"),w=(e,a)=>t.dispatchEvent(new CustomEvent("fx:ocean-"+e,{bubbles:!0,detail:a}));function O(e){return t.classList.add("fx-ocean--flat","is-ready"),t.fxOcean={quality:"none",get mood(){return y},level:0,frames:0,moods:Object.keys(k),setMood(a){k[a]&&(y=a,t.setAttribute("data-mood",a),w("mood",{mood:a}))},setQuality(){},go(a){typeof a=="number"&&i[a]&&i[a].el.scrollIntoView({block:"center"})}},w("fallback",{reason:e}),t.fxOcean}let o=null;try{o=h.getContext("webgl",{antialias:!1,alpha:!1,depth:!1,stencil:!1,powerPreference:"high-performance"})}catch{o=null}if(!o)return O("no-webgl");let pe=o.getShaderPrecisionFormat(o.FRAGMENT_SHADER,o.HIGH_FLOAT);if(!pe||!pe.precision)return O("no-highp");let G=!1;for(let e=t.parentElement;e&&e!==document.documentElement;e=e.parentElement){if(e===document.body)continue;let a=getComputedStyle(e);if(/(auto|scroll|hidden)/.test(a.overflowY+a.overflowX)){G=!0;break}}G&&i.length&&c.classList.add("is-manual");let b=Qe(t.getAttribute("data-quality")),Ne=!U[t.getAttribute("data-quality")],T=U[b],j=null,m={},qe=o.createBuffer(),ve=()=>{o.bindBuffer(o.ARRAY_BUFFER,qe),o.bufferData(o.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),o.STATIC_DRAW)};ve();function V(){let e=`#define GEO ${T.geo}
#define NRM ${T.nrm}
#define STEPS ${T.steps}
`,a=(d,A)=>{let M=o.createShader(d);return o.shaderSource(M,e+A.replace("//#include sea",ke)),o.compileShader(M),!o.getShaderParameter(M,o.COMPILE_STATUS)&&!o.isContextLost()?(console.error("fx-ocean: "+o.getShaderInfoLog(M)),null):M},l=a(o.VERTEX_SHADER,Le),r=a(o.FRAGMENT_SHADER,Te);if(!l||!r)return!1;let f=o.createProgram();return o.attachShader(f,l),o.attachShader(f,r),o.bindAttribLocation(f,0,"p"),o.linkProgram(f),o.getProgramParameter(f,o.LINK_STATUS)?(j&&o.deleteProgram(j),j=f,o.useProgram(f),o.enableVertexAttribArray(0),o.vertexAttribPointer(0,2,o.FLOAT,!1,0,0),m={},["uRes","uTime","uSea","uCam","uLook","uSun","uSunCol","uZen","uHor","uDeep","uShal","uAir","uFx","uBolt"].forEach(d=>{m[d]=o.getUniformLocation(f,d)}),!0):(console.error("fx-ocean: "+o.getProgramInfoLog(f)),!1)}if(!V())return O("shader");let n=Ee(k[y]),B=n.slice(),X=!1,se=(e,a)=>{let l=parseFloat(t.getAttribute(e));return isNaN(l)?a:l},De=se("data-speed",1),Oe=se("data-drift",.6),Be=g(se("data-waves",1),0,3),Pe=t.getAttribute("data-lightning")!=="off"&&!s,u={level:3.2,pitch:-5,turn:0,fov:60},p={level:3.2,pitch:-5,turn:0,fov:60},x={x:0,y:0,cx:0,cy:0},Y=1,Z=1,z=!0,N=!0,Q=-1,ce=!0,q=null,$=e=>e.fov||(Y/Z<.8?76:Y/Z<1.2?68:60),W=e=>{p.level=e.level,p.pitch=e.pitch,p.turn=e.turn,p.fov=$(e)};function P(){if(q){W(q);return}if(!i.length){W(Ce(t,null));return}let e=window.innerHeight/2,a=i.length,l=-1;for(let F=0;F<a;F++){let C=i[F].el.getBoundingClientRect();if(F===0&&e<C.top){l=.5;break}if(e>=C.top&&e<C.bottom){l=F+(e-C.top)/Math.max(1,C.height);break}}l<0&&(l=a-.5);let r=g(Math.floor(l),0,a-1);if(r!==Q){let F=Q;if(Q=r,i.forEach((C,Ie)=>C.el.classList.toggle("is-active",Ie===r)),i[r].view.mood&&i[r].view.mood!==y&&F!==-1&&ne.setMood(i[r].view.mood),w("stop",{index:r,level:i[r].view.level}),s&&!ce){W(i[r].view),ge();return}}if(s){W(i[r].view),L.classList.contains("is-cut")||D();return}let f=Math.max(0,l-.5),d=g(Math.floor(f),0,a-1),A=g(d+1,0,a-1),M=Xe(g((f-Math.floor(f)-.12)/.76,0,1)),_=i[d].view,le=i[A].view;p.level=_.level+(le.level-_.level)*M,p.pitch=_.pitch+(le.pitch-_.pitch)*M,p.turn=_.turn+(le.turn-_.turn)*M,p.fov=$(_)+($(le)-$(_))*M}let xe=0;function ge(){L.classList.add("is-cut"),clearTimeout(xe),xe=setTimeout(()=>{D(),L.classList.remove("is-cut")},170)}function D(){Object.assign(u,p),z=!0}function K(){Y=Math.max(1,c.clientWidth),Z=Math.max(1,c.clientHeight);let e=T.scale*Math.min(window.devicePixelRatio||1,T.dpr),a=Math.max(2,Math.round(Y*e)),l=Math.max(2,Math.round(Z*e));(h.width!==a||h.height!==l)&&(h.width=a,h.height=l),z=!0,N=!0}function He(){let e=t.getBoundingClientRect();c.style.transform=`translateY(${g(-e.top,0,Math.max(0,e.height-c.offsetHeight)).toFixed(1)}px)`}let S=s?21.4:0,ye=null,J=0,E=[],fe=2.5,H=[0,0,0,.2],ue=0,de=0,ee=null;function we(){let e=n[0]*R,a=n[1]*R,l=n[5],r=n[18]*Be,f=320,d=S*Oe/f;o.viewport(0,0,h.width,h.height),o.uniform2f(m.uRes,h.width,h.height),o.uniform1f(m.uTime,S*De%3600),o.uniform4f(m.uSea,Math.max(.05,r),n[19],.26,-Math.PI/2+.4),o.uniform3f(m.uCam,f*(1-Math.cos(d)),u.level-Math.max(.05,r)*.53,f*Math.sin(d)),o.uniform3f(m.uLook,(u.turn+x.cx*7)*R,(u.pitch-x.cy*3.5)*R,.5/Math.tan(u.fov*R/2)),o.uniform3f(m.uSun,Math.sin(a)*Math.cos(e),Math.sin(e),Math.cos(a)*Math.cos(e)),o.uniform3f(m.uSunCol,n[2]*l,n[3]*l,n[4]*l),o.uniform3f(m.uZen,n[6],n[7],n[8]),o.uniform3f(m.uHor,n[9],n[10],n[11]),o.uniform3f(m.uDeep,n[12],n[13],n[14]),o.uniform3f(m.uShal,n[15],n[16],n[17]),o.uniform4f(m.uAir,n[20],n[21],n[22],n[23]),o.uniform4f(m.uFx,J,s?0:n[24],s?0:Math.max(ue,de),n[26]),o.uniform4f(m.uBolt,H[0],H[1],J>.03?Math.min(1,J):0,H[3]),o.drawArrays(o.TRIANGLES,0,3);let A=Math.round(u.level*10)/10;A!==ye&&(ye=A,t.style.setProperty("--fx-ocean-level",String(A)),w("level",{level:A,under:A<0}))}let te=!1,he=!1,oe=0,me=0,ae=0,I=0,be=0,Se=!1,ie=!1;function Me(e){Pe&&n[25]>.5&&(fe-=e,fe<=0&&(fe=5+Math.random()*8,E=[[S,1],[S+.2,.55]],H=[(u.turn+(Math.random()*60-30))*R,Math.random()*97,0,.1+Math.random()*.12]));let a=0;for(let[l,r]of E)S>=l&&(a+=r*Math.exp(-(S-l)*11));if(J=a*g((n[25]-.5)*2,0,1),E.length&&S-E[E.length-1][0]>1.5&&(E=[]),ee!=null){let l=(ee-u.level)/e;ue+=(g(l*.3,0,1)-ue)*(1-Math.exp(-e*3)),ee>=0&&u.level<0&&(de=1),de*=Math.exp(-e*.7)}ee=u.level}function ze(e){if(oe=0,!te||he||ie||document.hidden)return;let a=e-me,l=g(a/1e3||.016,.001,.05);if(me=e,s||(S+=l),(N||G)&&(N=!1,P(),G&&He()),ce&&(D(),ce=!1),X){let r=0,f=s?1:1-Math.exp(-l*1.6);for(let d=0;d<n.length;d++)n[d]+=(B[d]-n[d])*f,r=Math.max(r,Math.abs(B[d]-n[d]));r<.002&&(n=B.slice(),X=!1),z=!0}if(!s){let r=1-Math.exp(-l*3),f=1-Math.exp(-l*2.5);u.level+=(p.level-u.level)*r,u.pitch+=(p.pitch-u.pitch)*r,u.turn+=(p.turn-u.turn)*r,u.fov+=(p.fov-u.fov)*r,x.cx+=(x.x-x.cx)*f,x.cy+=(x.y-x.cy)*f,Me(l)}(!s||z)&&(we(),z=!1,ae++,Se||(Se=!0,t.classList.add("is-ready"),w("ready",{quality:b}))),Ne&&ae>30&&a<400&&(I=a>38?I+1:Math.max(0,I-2),I>60&&e-be>3e3&&b!=="low"&&(I=0,be=e,Ae(Fe[Fe.indexOf(b)-1]))),oe=requestAnimationFrame(ze)}function v(){!oe&&te&&!he&&!ie&&!document.hidden&&(me=performance.now(),oe=requestAnimationFrame(ze))}function Ae(e){if(!U[e]||e===b)return;let a=T,l=b;b=e,T=U[e],V()||(b=l,T=a,V()),K(),v(),w("quality",{quality:b})}K(),P(),D(),t.addEventListener("pointermove",e=>{if(e.pointerType!=="mouse"||s)return;let a=c.getBoundingClientRect();x.x=g((e.clientX-a.left)/a.width*2-1,-1,1),x.y=g((e.clientY-a.top)/a.height*2-1,-1,1)},{passive:!0}),t.addEventListener("pointerleave",()=>{x.x=0,x.y=0}),window.addEventListener("scroll",()=>{N=!0,q&&i.length&&(q=null),v()},{passive:!0}),window.addEventListener("resize",()=>{K(),v()}),"ResizeObserver"in window&&new ResizeObserver(()=>{K(),v()}).observe(c),document.addEventListener("visibilitychange",v),"IntersectionObserver"in window?new IntersectionObserver(e=>{te=e[e.length-1].isIntersecting,v()},{rootMargin:"60px 0px"}).observe(t):(te=!0,v()),h.addEventListener("webglcontextlost",e=>{e.preventDefault(),ie=!0}),h.addEventListener("webglcontextrestored",()=>{ie=!1,ve(),j=null,V(),z=!0,v()});let ne={get quality(){return b},get mood(){return y},get level(){return u.level},get frames(){return ae},moods:Object.keys(k),setMood(e,a){k[e]&&(y=e,t.setAttribute("data-mood",e),B=Ee(k[e]),a||s?(n=B.slice(),X=!1,z=!0):X=!0,w("mood",{mood:e}),v())},setQuality:Ae,go(e,a){if(typeof e=="number"&&i[e]){i[e].el.scrollIntoView({behavior:s||a?"auto":"smooth",block:"center"});return}if(e&&typeof e=="object"){let l=e.level!=null?+e.level:p.level;q={level:l,pitch:e.pitch!=null?+e.pitch:Re(l),turn:e.turn!=null?+e.turn:p.turn,fov:e.fov||0}}else q=null;N=!0,a?(P(),D()):s&&(P(),ge()),v()},_debug:{settle(){N=!1,P(),D(),v()},pause(e){he=!!e,v()},time(e){S=e,z=!0,v()},flash(e){E=e?[[S,e]]:[],H=[u.turn*R+.15,12.3,0,.18],Me(.001),z=!0,v()},draw(){we(),ae++},gl:o}};t.fxOcean=ne;for(let e=Q;e>=0;e--)if(i[e]&&i[e].view.mood){i[e].view.mood!==y&&ne.setMood(i[e].view.mood,!0);break}return ne}var re=window.FX=window.FX||{};re.ocean=function(t){(t||document).querySelectorAll(".fx-ocean").forEach(s=>{s.fxOcean||$e(s)})};re.ocean.moods=Object.keys(k);document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>re.ocean()):re.ocean();})();