'use client';

import { useEffect } from 'react';
import { duckAmbient } from '@/lib/audio/ambient';
import { depthFromLevel, setOceanDepthFromLevel, setOceanMood } from '@/lib/audio/ocean-sea';
import { reconcileSeaMood } from '@/lib/sea-mood';

/** Drive body/biolume darkening from the live ocean camera. */
const applyDepthCss = (level: number) => {
  const doc = document.documentElement;
  const d = depthFromLevel(level);
  doc.style.setProperty('--depth', d.toFixed(4));
  doc.style.setProperty('--depth-m', String(Math.max(0, Math.round(-level))));
};

const clearDepthCss = () => {
  const doc = document.documentElement;
  doc.style.removeProperty('--depth');
  doc.style.removeProperty('--depth-m');
};

declare global {
  interface HTMLElement {
    fxOcean?: {
      setMood: (mood: string, instant?: boolean) => void;
      setQuality?: (quality: string) => void;
      go: (index: number) => void;
      mood: string;
      level: number;
      _debug?: { flash?: (strength?: number) => void };
    };
  }
}

/**
 * Loads public/ocean.js once for every `.fx-ocean` (homepage dive + ambient pages).
 */
export function OceanBoot() {
  useEffect(() => {
    const seas = [...document.querySelectorAll<HTMLElement>('.fx-ocean')];
    if (!seas.length) return;

    const dive = document.querySelector<HTMLElement>('.fx-ocean.dive');
    const gauge = document.querySelector<HTMLElement>('.ocean-gauge');
    let cancelled = false;

    const wireGauge = () => {
      if (!gauge || !dive) return;
      const num = gauge.querySelector<HTMLElement>('[data-ocean-num]');
      const label = gauge.querySelector<HTMLElement>('[data-ocean-label]');
      const pos = (lv: number) =>
        lv >= 0
          ? 0.2 * (1 - Math.log1p(Math.min(lv, 10) / 2) / Math.log1p(5))
          : 0.2 + (0.8 * Math.log1p(Math.min(-lv, 200) / 2)) / Math.log1p(100);

      const onLevel = (e: Event) => {
        const lv = (e as CustomEvent<{ level: number }>).detail.level;
        const a = Math.abs(lv);
        if (num) num.textContent = a < 0.05 ? '0' : a < 10 ? a.toFixed(1) : String(Math.round(a));
        if (label) label.textContent = lv < -0.05 ? 'עומק' : 'גובה';
        gauge.style.setProperty('--p', pos(lv).toFixed(4));
        gauge.classList.toggle('is-under', lv < -0.05);
        setOceanDepthFromLevel(lv);
        applyDepthCss(lv);
      };
      const onReady = () => dive.classList.add('is-ready');
      const onFallback = () => gauge.remove();

      dive.addEventListener('fx:ocean-level', onLevel);
      dive.addEventListener('fx:ocean-ready', onReady);
      dive.addEventListener('fx:ocean-fallback', onFallback);

      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver(
          (entries) => gauge.classList.toggle('is-on', entries[entries.length - 1]?.isIntersecting ?? false),
          { rootMargin: '-35% 0px -35% 0px' },
        );
        io.observe(dive);
        return () => {
          io.disconnect();
          dive.removeEventListener('fx:ocean-level', onLevel);
          dive.removeEventListener('fx:ocean-ready', onReady);
          dive.removeEventListener('fx:ocean-fallback', onFallback);
        };
      }
      gauge.classList.add('is-on');
      return () => {
        dive.removeEventListener('fx:ocean-level', onLevel);
        dive.removeEventListener('fx:ocean-ready', onReady);
        dive.removeEventListener('fx:ocean-fallback', onFallback);
      };
    };

    const existing = document.getElementById('fx-ocean-lib') as HTMLScriptElement | null;
    let unwire: (() => void) | undefined;

    const boot = () => {
      if (cancelled) return;
      unwire = wireGauge();
      seas.forEach((sea) => {
        sea.classList.add('is-ready');
        reconcileSeaMood(sea.fxOcean?.mood || sea.dataset.mood || 'sunset');
        /* Keep Gerstner detail locked — auto-downgrade flattens the kit waves. */
        const q = sea.dataset.quality;
        if (q === 'high' || q === 'mid' || q === 'low') {
          sea.fxOcean?.setQuality?.(q);
        }
      });
    };

    if (existing) {
      if (existing.dataset.loaded === '1') boot();
      else existing.addEventListener('load', boot, { once: true });
    } else {
      const script = document.createElement('script');
      script.id = 'fx-ocean-lib';
      /* Cache-bust so the authentic kit shader always reloads after sync. */
      script.src = `/ocean.js?v=kit5`;
      script.async = true;
      script.addEventListener(
        'load',
        () => {
          script.dataset.loaded = '1';
          boot();
        },
        { once: true },
      );
      document.body.appendChild(script);
    }

    const diveBtn = document.querySelector('[data-ocean-dive]');
    const onDive = () => dive?.fxOcean?.go(1);
    diveBtn?.addEventListener('click', onDive);

    /* Sync ocean mood → CTAs + sea audio. Locked mood cannot be overridden by dive stops. */
    const onMood = (e: Event) => {
      const mood = reconcileSeaMood((e as CustomEvent<{ mood: string }>).detail.mood);
      if (mood) setOceanMood(mood);
    };
    seas.forEach((sea) => {
      sea.addEventListener('fx:ocean-mood', onMood);
      const mood = reconcileSeaMood(sea.dataset.mood || 'sunset');
      if (mood) setOceanMood(mood);
    });
    /* Always listen on the dive for continuous depth → muffling + CSS darkening. */
    const onDiveLevel = (e: Event) => {
      const lv = (e as CustomEvent<{ level: number }>).detail.level;
      setOceanDepthFromLevel(lv);
      applyDepthCss(lv);
      /* Lounge ducks further underwater so the muffling reads clearly. */
      const under = lv >= 0 ? 0 : Math.min(1, -lv / 90);
      duckAmbient(0.28 * (1 - under * 0.75));
    };
    dive?.addEventListener('fx:ocean-level', onDiveLevel);
    if (dive?.fxOcean && typeof dive.fxOcean.level === 'number') {
      setOceanDepthFromLevel(dive.fxOcean.level);
      applyDepthCss(dive.fxOcean.level);
    }

    return () => {
      cancelled = true;
      unwire?.();
      diveBtn?.removeEventListener('click', onDive);
      dive?.removeEventListener('fx:ocean-level', onDiveLevel);
      seas.forEach((sea) => sea.removeEventListener('fx:ocean-mood', onMood));
      clearDepthCss();
    };
  }, []);

  return null;
}
