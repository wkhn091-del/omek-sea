'use client';

import { useEffect } from 'react';
import { prefersReducedMotion } from '@/lib/motion/lenis';

const TARGETS = '.btn-sea, .fx-magnet';

/**
 * Wires the kit-1 circle wipe: expand from entry point, collapse toward exit.
 * Markup (label + over) comes from OpenDrawerButton / static HTML.
 */
export function MagnetFill() {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const cleanups: Array<() => void> = [];
    const wired = new WeakSet<HTMLElement>();

    const setup = (el: HTMLElement) => {
      if (wired.has(el) || !el.querySelector('.fx-magnet__over')) return;
      wired.add(el);

      const setPoint = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const x = ((e.clientX - r.left) / Math.max(r.width, 1)) * 100;
        const y = ((e.clientY - r.top) / Math.max(r.height, 1)) * 100;
        el.style.setProperty('--fx-x', `${x.toFixed(1)}%`);
        el.style.setProperty('--fx-y', `${y.toFixed(1)}%`);
      };

      const onEnter = (e: PointerEvent) => {
        if (e.pointerType === 'touch') return;
        setPoint(e);
        el.classList.add('is-on');
      };
      const onMove = (e: PointerEvent) => {
        if (!el.classList.contains('is-on') || e.pointerType === 'touch') return;
        setPoint(e);
      };
      const onLeave = (e: PointerEvent) => {
        if (e.pointerType === 'touch') return;
        setPoint(e);
        el.classList.remove('is-on');
      };

      el.addEventListener('pointerenter', onEnter);
      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerleave', onLeave);
      cleanups.push(() => {
        el.removeEventListener('pointerenter', onEnter);
        el.removeEventListener('pointermove', onMove);
        el.removeEventListener('pointerleave', onLeave);
      });
    };

    const scan = () => document.querySelectorAll<HTMLElement>(TARGETS).forEach(setup);
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    cleanups.push(() => mo.disconnect());

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}
