'use client';

import { useEffect } from 'react';
import { prefersReducedMotion } from '@/lib/motion/lenis';

/** Real underwater detail — fish + small rocks/coral. No giant kelp/tree. */
const FISH_REMOTE =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_204221_5339e40b-e73d-4ab0-9c65-79c18c66fd50.mp4';
const FISH_LOCAL = '/sea/marine-life.mp4';
const ROCKS_PHOTO = '/sea/rocks.jpg';
const CORAL_PHOTO = '/sea/coral.jpg';

type Mote = {
  x: number;
  y: number;
  z: number;
  r: number;
  vy: number;
  vx: number;
  phase: number;
  bright: number;
};

type LayerKind = 'fish' | 'rocks' | 'coral';

type Layer = {
  wrap: HTMLDivElement;
  media: HTMLVideoElement | HTMLImageElement;
  kind: LayerKind;
};

/**
 * Sea life on the sticky ocean stage:
 * - Fish mid-water
 * - Small realistic rocks + coral on the seabed (never a full-frame giant plant)
 * - Marine-snow particles
 */
export function SeaLife() {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    let cancelled = false;
    let canvas: HTMLCanvasElement | null = null;
    let ctx: CanvasRenderingContext2D | null = null;
    let raf = 0;
    let level = 3.2;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let phone = false;
    let last = performance.now();
    let layers: Layer[] = [];
    let motes: Mote[] = [];
    let rootEl: HTMLElement | null = null;

    const sea = () => document.querySelector<HTMLElement>('.fx-ocean.dive');

    const depth01 = (lv: number) => {
      if (lv >= 0) return 0;
      return Math.min(1, Math.log1p(-lv / 2) / Math.log1p(70));
    };

    const readLevel = (el: HTMLElement | null) => {
      if (!el) return;
      const raw = getComputedStyle(el).getPropertyValue('--fx-ocean-level').trim();
      const n = parseFloat(raw);
      if (!Number.isNaN(n)) level = n;
    };

    const resize = () => {
      if (!canvas || !ctx) return;
      const stage = canvas.parentElement;
      if (!stage) return;
      const rect = stage.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, phone ? 1.25 : 1.75);
      w = Math.max(1, rect.width);
      h = Math.max(1, rect.height);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const seed = () => {
      phone = window.matchMedia('(pointer: coarse)').matches;
      motes = Array.from({ length: phone ? 28 : 110 }, () => ({
        x: Math.random(),
        y: Math.random(),
        z: Math.random(),
        r: 0.55 + Math.random() * 2.2,
        vy: 0.01 + Math.random() * 0.028,
        vx: (Math.random() - 0.5) * 0.02,
        phase: Math.random() * Math.PI * 2,
        bright: 0.4 + Math.random() * 0.55,
      }));
    };

    const opacityFor = (kind: LayerKind, d: number, lv: number) => {
      const abyssTaper = d > 0.7 ? Math.max(0.25, 1 - (d - 0.7) / 0.45) : 1;
      const phoneMul = phone ? 0.82 : 1;

      if (kind === 'fish') {
        if (lv > 0.35) return 0;
        if (lv > -0.8) return Math.min(0.5, (0.35 - lv) / 1.8) * phoneMul;
        return Math.min(0.78, 0.35 + d * 0.5) * phoneMul * abyssTaper;
      }
      // Rocks / coral: only once you're under, as small seabed detail — never a wall of vegetation
      if (d < 0.18) return 0;
      let op = 0;
      if (d < 0.4) op = ((d - 0.18) / 0.22) * 0.42;
      else op = Math.min(0.58, 0.4 + (d - 0.4) * 0.35);
      if (kind === 'coral') op *= 0.85;
      return op * phoneMul * abyssTaper;
    };

    const syncLayers = () => {
      const d = depth01(level);
      for (const layer of layers) {
        const opacity = opacityFor(layer.kind, d, level);
        layer.wrap.style.opacity = String(opacity);
        layer.wrap.style.visibility = opacity < 0.015 ? 'hidden' : 'visible';
        if (layer.media instanceof HTMLVideoElement) {
          if (opacity > 0.015 && layer.media.paused) layer.media.play().catch(() => undefined);
          if (opacity < 0.015 && !layer.media.paused) layer.media.pause();
        }
      }
    };

    const drawMotes = (t: number, alpha: number, dt: number) => {
      if (!ctx || alpha < 0.02) return;
      motes.forEach((m) => {
        m.y -= m.vy * dt * (0.35 + m.z);
        m.x += m.vx * dt + Math.sin(t * 0.6 + m.phase) * 0.0004;
        if (m.y < -0.02) {
          m.y = 1.02;
          m.x = Math.random();
        }
        if (m.x < -0.02) m.x = 1.02;
        if (m.x > 1.02) m.x = -0.02;
        const px = m.x * w;
        const py = m.y * h;
        const radius = m.r * (0.7 + m.z * 1.5) * (phone ? 0.9 : 1);
        const a = alpha * m.bright * (0.35 + m.z * 0.55);
        const g = ctx!.createRadialGradient(px, py, 0, px, py, radius * 2.2);
        g.addColorStop(0, `rgba(235, 245, 250, ${a})`);
        g.addColorStop(0.45, `rgba(180, 210, 225, ${a * 0.45})`);
        g.addColorStop(1, 'rgba(100, 140, 160, 0)');
        ctx!.fillStyle = g;
        ctx!.beginPath();
        ctx!.arc(px, py, radius * 2.2, 0, Math.PI * 2);
        ctx!.fill();
      });
    };

    const tick = (now: number) => {
      if (cancelled || !ctx) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = now / 1000;
      const d = depth01(level);
      const moteA = level > 0.2 ? 0 : Math.min(1, 0.35 + d * 0.9);

      syncLayers();
      ctx.clearRect(0, 0, w, h);

      if (d > 0.02) {
        const haze = ctx.createLinearGradient(0, 0, 0, h);
        haze.addColorStop(0, `rgba(4, 28, 42, ${0.04 + d * 0.18})`);
        haze.addColorStop(0.45, `rgba(2, 14, 24, ${0.08 + d * 0.32})`);
        haze.addColorStop(1, `rgba(0, 4, 10, ${0.15 + d * 0.55})`);
        ctx.fillStyle = haze;
        ctx.fillRect(0, 0, w, h);
      }

      drawMotes(t, moteA, dt);
      raf = requestAnimationFrame(tick);
    };

    const makeLayer = (
      stage: HTMLElement,
      kind: LayerKind,
      src: string,
      className: string,
    ) => {
      const wrap = document.createElement('div');
      wrap.className = className;
      wrap.setAttribute('aria-hidden', 'true');
      wrap.dataset.seaLife = kind;

      const isImage = /\.(jpe?g|png|webp)(\?|$)/i.test(src);
      let media: HTMLVideoElement | HTMLImageElement;
      if (isImage) {
        const img = document.createElement('img');
        img.className = 'sea-life-video__el';
        img.alt = '';
        img.decoding = 'async';
        img.src = src;
        // Anchor to seabed — cropped close so it reads as small reef detail, not a giant prop
        img.style.objectPosition = kind === 'coral' ? '45% 92%' : '50% 94%';
        media = img;
      } else {
        const video = document.createElement('video');
        video.className = 'sea-life-video__el';
        video.autoplay = true;
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.setAttribute('muted', '');
        video.setAttribute('playsinline', '');
        video.preload = 'auto';
        video.src = src;
        video.style.objectPosition = '70% center';
        media = video;
        video.play().catch(() => undefined);
      }

      wrap.appendChild(media);
      stage.appendChild(wrap);
      layers.push({ wrap, media, kind });
    };

    const clearStageLife = (stage: HTMLElement) => {
      stage.querySelectorAll('.sea-life-video, canvas.sea-life').forEach((el) => el.remove());
    };

    const mount = () => {
      const root = sea();
      if (!root || cancelled) return false;
      const stage = root.querySelector<HTMLElement>('.fx-ocean__stage');
      if (!stage) return false;

      clearStageLife(stage);
      layers = [];
      cancelAnimationFrame(raf);
      raf = 0;

      makeLayer(stage, 'fish', FISH_LOCAL, 'sea-life-video sea-life-video--fish');
      makeLayer(stage, 'rocks', ROCKS_PHOTO, 'sea-life-video sea-life-video--rocks');
      makeLayer(stage, 'coral', CORAL_PHOTO, 'sea-life-video sea-life-video--coral');

      const fish = layers.find((l) => l.kind === 'fish');
      if (fish?.media instanceof HTMLVideoElement) {
        fish.media.addEventListener(
          'error',
          () => {
            if (cancelled || !(fish.media instanceof HTMLVideoElement)) return;
            fish.media.src = FISH_REMOTE;
            fish.media.play().catch(() => undefined);
          },
          { once: true },
        );
      }

      canvas = document.createElement('canvas');
      canvas.className = 'sea-life';
      canvas.setAttribute('aria-hidden', 'true');
      stage.appendChild(canvas);
      ctx = canvas.getContext('2d', { alpha: true });
      if (!ctx) return false;

      rootEl = root;
      readLevel(root);
      seed();
      resize();
      syncLayers();
      last = performance.now();
      raf = requestAnimationFrame(tick);
      return true;
    };

    const onLevel = (e: Event) => {
      level = (e as CustomEvent<{ level: number }>).detail.level;
    };
    const onResize = () => resize();
    const onVis = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
        layers.forEach((l) => {
          if (l.media instanceof HTMLVideoElement) l.media.pause();
        });
      } else if (!raf && canvas && ctx) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
        layers.forEach((l) => {
          if (l.media instanceof HTMLVideoElement && Number(l.wrap.style.opacity) > 0.015) {
            l.media.play().catch(() => undefined);
          }
        });
      }
    };

    let tries = 0;
    const boot = () => {
      if (cancelled) return;
      if (mount()) {
        rootEl?.addEventListener('fx:ocean-level', onLevel);
        window.addEventListener('resize', onResize);
        document.addEventListener('visibilitychange', onVis);
        return;
      }
      if (tries++ < 40) window.setTimeout(boot, 120);
    };

    const root = sea();
    root?.addEventListener('fx:ocean-ready', boot, { once: true });
    boot();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      rootEl?.removeEventListener('fx:ocean-level', onLevel);
      root?.removeEventListener('fx:ocean-ready', boot);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVis);
      layers.forEach((l) => {
        if (l.media instanceof HTMLVideoElement) l.media.pause();
        l.wrap.remove();
      });
      layers = [];
      canvas?.remove();
      canvas = null;
      ctx = null;
    };
  }, []);

  return null;
}
