/**
 * Procedural sea: surf / foam / rain / deep pressure / storm thunder.
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
/** Quiet between storm strikes (ms) — short enough to notice, long enough to breathe. */
const THUNDER_GAP_MIN = 3200;
const THUNDER_GAP_SPAN = 7000;

/** Real recorded thunder / lightning (CC0 / public domain). */
const THUNDER_URLS = [
  '/audio/thunder/strike-01.mp3',
  '/audio/thunder/strike-03.mp3',
  '/audio/thunder/roll-01.mp3',
] as const;

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

/**
 * Loudness order (intentional): storm > night > sunset > day.
 * Character also diverges so each pick is obvious without looking.
 */
const MOOD: Record<SeaMood, MoodMix> = {
  /* Soft bright wash — quietest bed */
  day: {
    surf: 0.55,
    foam: 0.28,
    rain: 0,
    pressure: 0.12,
    swellHz: 0.11,
    swellAmt: 0.22,
    surfHz: 980,
    air: 1,
  },
  /* Warmer mid — more body than day, still calm */
  sunset: {
    surf: 0.85,
    foam: 0.42,
    rain: 0,
    pressure: 0.38,
    swellHz: 0.09,
    swellAmt: 0.4,
    surfHz: 640,
    air: 0.62,
  },
  /* Heavy low sea — louder than sunset, dark and close */
  night: {
    surf: 1.05,
    foam: 0.22,
    rain: 0,
    pressure: 0.95,
    swellHz: 0.055,
    swellAmt: 0.48,
    surfHz: 360,
    air: 0.22,
  },
  /* Loudest — rain, foam, punchy surf + thunder */
  storm: {
    surf: 1.55,
    foam: 1.2,
    rain: 1.15,
    pressure: 1.1,
    swellHz: 0.26,
    swellAmt: 0.7,
    surfHz: 1250,
    air: 0.95,
  },
};

/** Master loudness multipliers — storm > night > sunset > day */
const MOOD_LOUD: Record<SeaMood, number> = {
  day: 0.55,
  sunset: 0.82,
  night: 1.12,
  storm: 1.45,
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

/** Storm thunder — real sample playback on a loud parallel bus. */
let thunderBus: GainNode | null = null;
let thunderSamples: AudioBuffer[] = [];
let thunderLoad: Promise<void> | null = null;
let thunderTimer = 0;

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

  // —— Thunder bus (real samples; bypass bed compressor) ——
  thunderBus = context.createGain();
  thunderBus.gain.value = phone ? 0.95 : 0.78;
  thunderBus.connect(context.destination);
  void loadThunderSamples(context);

  for (const source of sources) source.start();
  return out;
}

async function loadThunderSamples(context: AudioContext) {
  if (thunderSamples.length) return;
  if (thunderLoad) {
    await thunderLoad;
    return;
  }
  thunderLoad = (async () => {
    const buffers: AudioBuffer[] = [];
    for (const url of THUNDER_URLS) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const raw = await res.arrayBuffer();
        buffers.push(await context.decodeAudioData(raw.slice(0)));
      } catch {
        /* skip missing sample */
      }
    }
    thunderSamples = buffers;
  })();
  await thunderLoad;
}

function clearThunderTimer() {
  if (!thunderTimer) return;
  window.clearTimeout(thunderTimer);
  thunderTimer = 0;
}

/** Arm the storm cadence. `immediate` fires a strike almost now. */
function armThunder(immediate = false) {
  clearThunderTimer();
  if (!enabled || mood !== 'storm' || !ctx) return;
  const wait = immediate ? 120 + Math.random() * 380 : THUNDER_GAP_MIN + Math.random() * THUNDER_GAP_SPAN;
  thunderTimer = window.setTimeout(() => {
    thunderTimer = 0;
    if (!enabled || mood !== 'storm') return;
    void strikeThunder();
    armThunder(false);
  }, wait);
}

/**
 * Play a real thunder / lightning recording.
 * Near = crack samples louder & brighter; far = long roll, quieter & darker.
 */
async function strikeThunder() {
  if (!ctx || !thunderBus) return;
  if (ctx.state !== 'running') await ctx.resume().catch(() => undefined);
  await loadThunderSamples(ctx);
  if (!thunderSamples.length || mood !== 'storm' || !enabled) return;

  const context = ctx;
  const now = context.currentTime;
  const surface = Math.max(0.2, Math.pow(1 - depth01, 1.05));
  if (depth01 > 0.92) return;

  const near = Math.random() > 0.38;
  // Prefer short cracks up close; long roll for distant.
  const pool = near
    ? thunderSamples.filter((b) => b.duration < 8)
    : thunderSamples;
  const picks = pool.length ? pool : thunderSamples;
  const buffer = picks[Math.floor(Math.random() * picks.length)]!;

  const src = context.createBufferSource();
  src.buffer = buffer;
  src.playbackRate.value = near
    ? 0.94 + Math.random() * 0.14
    : 0.72 + Math.random() * 0.18;

  const lp = context.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = near ? 14000 * surface + 900 : 4200 * surface + 500;
  lp.Q.value = 0.5;

  const g = context.createGain();
  const peak = (near ? 1.15 : 0.7) * surface * (phone ? 1.2 : 1);
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(Math.max(0.002, peak), now + 0.02);
  // Fade out before end so looping cadence stays clean
  const dur = Math.min(buffer.duration / src.playbackRate.value, near ? 6 : 12);
  g.gain.setValueAtTime(Math.max(0.002, peak), now + Math.max(0.3, dur - 0.9));
  g.gain.exponentialRampToValueAtTime(0.0001, now + dur);

  src.connect(lp).connect(g).connect(thunderBus);
  // Distant roll: start a bit into the file so it feels farther
  const offset = !near && buffer.duration > 4 ? Math.random() * Math.min(4, buffer.duration * 0.35) : 0;
  src.start(now, offset, dur);

  // Flash the ocean lightning when available (visual sync)
  try {
    const sea = document.querySelector<HTMLElement>('.fx-ocean');
    sea?.fxOcean?._debug?.flash?.(near ? 1 : 0.55);
  } catch {
    /* ignore */
  }
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
  master.gain.setTargetAtTime(peak * MOOD_LOUD[mood], now, 0.18);

  // Layer weights — night leans on pressure, storm on rain/foam, day stays airy/soft
  const surfMul = mood === 'night' ? 0.7 : mood === 'day' ? 0.75 : 0.9;
  const foamMul = mood === 'storm' ? 0.7 : mood === 'night' ? 0.28 : 0.45;
  const rainMul = mood === 'storm' ? 0.85 : 0.5;
  const pressureMul =
    mood === 'night' ? 0.55 + underGate * 0.85
    : mood === 'storm' ? 0.28 + underGate * 0.9
    : mood === 'sunset' ? 0.16 + underGate * 0.75
    : 0.08 + underGate * 0.55;

  surfBase.gain.setTargetAtTime(m.surf * surfMul * surfaceGate, now, 0.18);
  foamBase.gain.setTargetAtTime(m.foam * foamMul * surfaceGate * Math.max(0.35, m.air), now, 0.18);
  rainBase.gain.setTargetAtTime(m.rain * rainMul * (0.45 + 0.55 * surfaceGate), now, 0.18);
  pressureBase.gain.setTargetAtTime(m.pressure * pressureMul, now, 0.2);

  // Tone: day bright → sunset warm → night muffled → storm harsh open
  const openHz =
    mood === 'day' ? 7200
    : mood === 'sunset' ? 4800
    : mood === 'night' ? 2200
    : 6500;
  const closedHz = mood === 'night' ? 140 : 180 + m.air * 60;
  muffler.frequency.setTargetAtTime(openHz * (1 - d) + closedHz * d, now, 0.18);

  surfFilter.frequency.setTargetAtTime(m.surfHz * (1 - d * 0.7), now, 0.2);
  surfFilter.Q.setTargetAtTime(mood === 'storm' ? 0.85 : mood === 'night' ? 0.45 : 0.6, now, 0.25);

  if (swellLfo && swellAmt) {
    swellLfo.frequency.setTargetAtTime(m.swellHz * (1 + d * 0.4), now, 0.3);
    swellAmt.gain.setTargetAtTime(m.swellAmt * surfaceGate, now, 0.3);
  }

  if (mood === 'storm') {
    if (!thunderTimer) armThunder(false);
  } else {
    clearThunderTimer();
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
    if (thunderBus) {
      thunderBus.gain.cancelScheduledValues(now);
      thunderBus.gain.setValueAtTime(phone ? 0.95 : 0.78, now);
    }
    await loadThunderSamples(ctx);
    // If already in storm when sound turns on — don't wait a long gap for the first crack.
    if (mood === 'storm') armThunder(true);
    return true;
  } catch {
    enabled = false;
    return false;
  }
}

export function stopOceanSea() {
  enabled = false;
  clearThunderTimer();
  if (!ctx || !master) return;
  const now = ctx.currentTime;
  master.gain.cancelScheduledValues(now);
  master.gain.setValueAtTime(master.gain.value, now);
  master.gain.linearRampToValueAtTime(0, now + 0.65);
  if (thunderBus) {
    thunderBus.gain.cancelScheduledValues(now);
    thunderBus.gain.setValueAtTime(thunderBus.gain.value, now);
    thunderBus.gain.linearRampToValueAtTime(0, now + 0.4);
  }
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
  const prev = mood;
  mood = next;
  if (enabled && ctx) {
    // Mood change should feel immediate — apply now, not only next frame.
    applyMix();
    if (next === 'storm' && prev !== 'storm') {
      void loadThunderSamples(ctx).then(() => {
        if (enabled && mood === 'storm') armThunder(true);
      });
    }
    if (next !== 'storm') clearThunderTimer();
  }
}

export function isOceanSeaOn() {
  return enabled;
}
