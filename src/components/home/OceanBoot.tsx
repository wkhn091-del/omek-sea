'use client';

import { useEffect } from 'react';

declare global {
  interface HTMLElement {
    fxOcean?: {
      setMood: (mood: string) => void;
      go: (index: number) => void;
      mood: string;
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
      seas.forEach((sea) => sea.classList.add('is-ready'));
    };

    if (existing) {
      if (existing.dataset.loaded === '1') boot();
      else existing.addEventListener('load', boot, { once: true });
    } else {
      const script = document.createElement('script');
      script.id = 'fx-ocean-lib';
      script.src = '/ocean.js';
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

    return () => {
      cancelled = true;
      unwire?.();
      diveBtn?.removeEventListener('click', onDive);
    };
  }, []);

  return null;
}
