/**
 * Procedural sea: surf / foam / rain / deep pressure.
 * Depth behaves like real water — highs die in the first metres, then only a dull rumble.
 * Moods are four distinct beds (day / sunset / night / storm).
 *
 * Important: depth events fire every frame. We must NOT cancel ScheduledValues every
 * frame or the mix never moves — updates are rAF-coalesced.
 */

import type { SeaMood } from '@/lib/sea-mood';

const FADE_S = 1.2;
const MASTER = 0.28;
const PHONE_MASTER = 0.45;

type MoodMix = {
  /** Relative surface-wave loudness */
  surf: number;
  /** High foam / spray */
  foam: number;
  /** Storm rain layer */
  rain: number;
  /** Sub pressure / rumble bias */
  pressure: number;
  /** Swell rate (Hz) */
  swellHz: number;
  /** Swell depth (0–1 of surf) */
  swellAmt: number;
  /** Surface filter centre */
  surfHz: number;
  /** How open the air feels (1 = bright day) */
  air: number;
};

const MOOD: Record<SeaMood, MoodMix> = {
  day: {
    surf: 1,
    foam: 0.7,
    rain: 0,
    pressure: 0.25,
    swellHz: 0.14,
    swellAmt: 0.35,
    surfHz: 900,
    air: 1,
  },
  sunset: {
    surf: 0.75,
    foam: 0.4,
    rain: 0,
    pressure: 0.35,
    swellHz: 0.1,
    swellAmt: 0.4,
    surfHz: 620,
    air: 0.65,
  },
  night: {
    surf: 0.35,
    foam: 0.12,
    rain: 0,
    pressure: 0.55,
    swellHz: 0.07,
    swellAmt: 0.25,
    surfHz: 420,
    air: 0.3,
  },
  storm: {
    surf: 1.25,
    foam: 1,
    rain: 1,
    pressure: 0.85,
    swellHz: 0.22,
    swellAmt: 0.55,
    surfHz: 1100,
    air: 0.9,
  },
};

let ctx: AudioContext | null = null;
let master: GainNode | null = null;

/** Base gains we automate (LFOs never write these). */
let surfBase: GainNode | null = null;
let foamBase: GainNode | null = null;
let rainBase: GainNode | null = null;
let pressureBase: GainNode | null = null;

let muffler: BiquadFilterNode | null = null;
let surfFilter: BiquadFilterNode | null = null;
let swellLfo: OscillatorNode | null = null;
let swellAmt: GainNode | null = null;

let sources: AudioScheduledSourceNode[] = [];
let enabled = false;
let phone = false;
let depth01 = 0;
let mood: SeaMood = 'sunset';
let raf = 0;
let dirty = false;

const isPhone = () => window.matchMedia('(pointer: coarse)').matches;

function preferPlaybackSession() {
  const session = (navigator as Navigator & { audioSession?: { type: string } }).audioSession;
  if (session) session.type = 'playback';
}

function noiseBuffer(context: AudioContext, seconds: number): AudioBuffer {
  const length = Math.floor(context.sampleRate * seconds);
  const buffer = context.createBuffer(2, length, context.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      data[i] = (b0 + b1 + b2 + white * 0.15) * 0.2;
    }
  }
  return buffer;
}

function loopNoise(context: AudioContext, destination: AudioNode, buffer: AudioBuffer) {
  const src = context.createBufferSource();
  src.buffer = buffer;
  src.loop = true;
  src.connect(destination);
  sources.push(src);
  return src;
}

/**
 * Real-ish submersion curve from ocean camera level.
 * 0 on/above surface → ~0.55 by −8m → ~0.85 by −40m → 1 by −120m.
 */
export function depthFromLevel(level: number): number {
  if (level >= 0.2) return 0;
  if (level >= 0) return 0.08 * (1 - level / 0.2);
  const metres = -level;
  // Fast loss in the first metres (ears / splash zone), then slow crawl to the abyss.
  const near = 1 - Math.exp(-metres / 6);
  const far = 1 - Math.exp(-metres / 55);
  return Math.min(1, near * 0.55 + far * 0.45);
}

function build(context: AudioContext): GainNode {
  const out = context.createGain();
  out.gain.value = 0;

  const compressor = context.createDynamicsCompressor();
  compressor.threshold.value = phone ? -12 : -18;
  compressor.knee.value = 16;
  compressor.ratio.value = 3.2;
  compressor.release.value = 0.4;
  out.connect(compressor).connect(context.destination);

  const noise = noiseBuffer(context, phone ? 2 : 3.2);

  muffler = context.createBiquadFilter();
  muffler.type = 'lowpass';
  muffler.frequency.value = 5000;
  muffler.Q.value = 0.5;
  muffler.connect(out);

  // —— Surf (mid band) ——
  surfFilter = context.createBiquadFilter();
  surfFilter.type = 'bandpass';
  surfFilter.frequency.value = 700;
  surfFilter.Q.value = 0.6;
  surfBase = context.createGain();
  surfBase.gain.value = 0.7;
  const surfOut = context.createGain();
  surfOut.gain.value = 1;
  surfFilter.connect(surfBase).connect(surfOut).connect(muffler);
  loopNoise(context, surfFilter, noise);

  // Swell modulates a separate gain (does not fight automation on surfBase)
  swellLfo = context.createOscillator();
  swellLfo.frequency.value = 0.1;
  swellAmt = context.createGain();
  swellAmt.gain.value = 0.3;
  const swellBias = context.createConstantSource();
  swellBias.offset.value = 1;
  swellBias.connect(surfOut.gain);
  swellLfo.connect(swellAmt).connect(surfOut.gain);
  sources.push(swellLfo, swellBias);

  // —— Foam / spray (high) ——
  const foamHp = context.createBiquadFilter();
  foamHp.type = 'highpass';
  foamHp.frequency.value = 2200;
  foamHp.Q.value = 0.45;
  foamBase = context.createGain();
  foamBase.gain.value = 0.25;
  foamHp.connect(foamBase).connect(muffler);
  loopNoise(context, foamHp, noise);

  // —— Rain (storm only) ——
  const rainHp = context.createBiquadFilter();
  rainHp.type = 'bandpass';
  rainHp.frequency.value = 5500;
  rainHp.Q.value = 0.8;
  rainBase = context.createGain();
  rainBase.gain.value = 0;
  rainHp.connect(rainBase).connect(out);
  loopNoise(context, rainHp, noise);

  // —— Deep pressure (bypasses muffler so abyss still has body) ——
  const rumbleLp = context.createBiquadFilter();
  rumbleLp.type = 'lowpass';
  rumbleLp.frequency.value = 140;
  rumbleLp.Q.value = 0.8;
  pressureBase = context.createGain();
  pressureBase.gain.value = 0.15;
  rumbleLp.connect(pressureBase).connect(out);
  loopNoise(context, rumbleLp, noise);

  const pulse = context.createOscillator();
  pulse.type = 'sine';
  pulse.frequency.value = 36;
  const pulseGain = context.createGain();
  pulseGain.gain.value = 0.035;
  pulse.connect(pulseGain).connect(pressureBase);
  sources.push(pulse);

  const throb = context.createOscillator();
  throb.frequency.value = 0.35;
  const throbAmt = context.createGain();
  throbAmt.gain.value = 0.02;
  throb.connect(throbAmt).connect(pulseGain.gain);
  sources.push(throb);

  for (const source of sources) source.start();
  return out;
}

function applyMix() {
  if (!enabled || !ctx || !master || !surfBase || !foamBase || !rainBase || !pressureBase || !muffler || !surfFilter) {
    return;
  }
  const m = MOOD[mood];
  const d = depth01;
  const now = ctx.currentTime;
  // Above water / splash zone still hears the sky; deep = almost only pressure.
  const surfaceGate = Math.pow(1 - d, 1.65);
  const underGate = Math.pow(d, 0.85);

  const peak = phone ? PHONE_MASTER : MASTER;
  // Storm louder overall; night quieter
  const moodLoud = mood === 'storm' ? 1.15 : mood === 'night' ? 0.7 : mood === 'day' ? 1 : 0.85;
  master.gain.setTargetAtTime(peak * moodLoud, now, 0.25);

  surfBase.gain.setTargetAtTime(m.surf * 0.85 * surfaceGate, now, 0.2);
  foamBase.gain.setTargetAtTime(m.foam * 0.45 * surfaceGate * m.air, now, 0.2);
  rainBase.gain.setTargetAtTime(m.rain * 0.55 * (0.35 + 0.65 * surfaceGate), now, 0.2);
  // Pressure rises underwater; storm has thunder body even near the surface
  pressureBase.gain.setTargetAtTime(m.pressure * (0.12 + underGate * 0.95), now, 0.25);

  // Muffle: ~6 kHz in air → ~250 Hz in the deep (real HF die-off)
  const openHz = 1800 + m.air * 4200;
  const closedHz = 180 + m.air * 80;
  muffler.frequency.setTargetAtTime(openHz * (1 - d) + closedHz * d, now, 0.22);

  surfFilter.frequency.setTargetAtTime(m.surfHz * (1 - d * 0.7), now, 0.25);

  if (swellLfo && swellAmt) {
    swellLfo.frequency.setTargetAtTime(m.swellHz * (1 + d * 0.4), now, 0.3);
    swellAmt.gain.setTargetAtTime(m.swellAmt * surfaceGate, now, 0.3);
  }
}

function scheduleApply() {
  dirty = true;
  if (raf) return;
  raf = requestAnimationFrame(() => {
    raf = 0;
    if (!dirty) return;
    dirty = false;
    applyMix();
  });
}

export async function startOceanSea(): Promise<boolean> {
  if (typeof window === 'undefined' || !('AudioContext' in window)) return false;
  try {
    preferPlaybackSession();
    if (!ctx) {
      phone = isPhone();
      ctx = new AudioContext({ latencyHint: phone ? 'playback' : 'interactive' });
    }
    const resumed = ctx.resume();
    master ??= build(ctx);
    await resumed;
    enabled = true;
    const fromDom = document.documentElement.dataset.seaMood;
    if (fromDom === 'day' || fromDom === 'sunset' || fromDom === 'night' || fromDom === 'storm') mood = fromDom;
    applyMix();
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(phone ? PHONE_MASTER : MASTER, now + FADE_S);
    return true;
  } catch {
    enabled = false;
    return false;
  }
}

export function stopOceanSea() {
  enabled = false;
  if (!ctx || !master) return;
  const now = ctx.currentTime;
  master.gain.cancelScheduledValues(now);
  master.gain.setValueAtTime(master.gain.value, now);
  master.gain.linearRampToValueAtTime(0, now + 0.65);
  const context = ctx;
  window.setTimeout(() => {
    if (!enabled) context.suspend().catch(() => undefined);
  }, 750);
}

export function setOceanHidden(hidden: boolean) {
  if (!ctx) return;
  if (hidden) ctx.suspend().catch(() => undefined);
  else if (enabled) ctx.resume().catch(() => undefined);
}

export function setOceanDepthFromLevel(level: number) {
  const next = depthFromLevel(level);
  if (Math.abs(next - depth01) < 0.004) return;
  depth01 = next;
  if (enabled) scheduleApply();
}

export function setOceanMood(next: string) {
  if (next !== 'day' && next !== 'sunset' && next !== 'night' && next !== 'storm') return;
  if (mood === next && !dirty) {
    // Still force one apply so a late start catches the pick.
  }
  mood = next;
  if (enabled && ctx) {
    // Mood change should feel immediate — apply now, not only next frame.
    applyMix();
  }
}

export function isOceanSeaOn() {
  return enabled;
}
