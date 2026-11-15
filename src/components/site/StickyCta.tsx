'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { track } from '@/lib/analytics';
import { FAB_MESSAGE, whatsappUrl } from '@/lib/domain/whatsapp';
import { OpenDrawerButton } from './OpenDrawerButton';
import { WhatsAppIcon } from './WhatsAppIcon';

const HERO_CTA_ID = 'hero-cta';

/**
 * Mobile only — slides in once the hero CTA leaves the screen.
 * Portaled to document.body so position:fixed never gets trapped by transforms.
 * Publishes --sticky-cta-height so the page leaves room under the bar.
 */
export function StickyCta({ whatsappNumber }: { whatsappNumber: string }) {
  const t = useTranslations('common');
  const tFab = useTranslations('fab');
  const pathname = usePathname();
  const [pastHero, setPastHero] = useState<{ path: string; past: boolean } | null>(null);
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const heroCta = document.getElementById(HERO_CTA_ID);
    if (!heroCta) return;
    const observer = new IntersectionObserver(([entry]) =>
      setPastHero({ path: pathname, past: !entry.isIntersecting && entry.boundingClientRect.top < 0 }),
    );
    observer.observe(heroCta);
    return () => observer.disconnect();
  }, [pathname]);

  // Pages with a hero CTA show the bar once it scrolls away; other pages (except /thanks) show it always.
  const observed = pastHero?.path === pathname ? pastHero.past : null;
  const visible = observed ?? (pathname !== '/' && pathname !== '/thanks');

  useEffect(() => {
    const root = document.documentElement;
    const mobile = window.matchMedia('(max-width: 767px)');
    const el = ref.current;

    const apply = () => {
      const show = visible && mobile.matches;
      const height = show && el ? el.offsetHeight : 0;
      root.style.setProperty('--sticky-cta-height', `${height}px`);
      root.classList.toggle('has-sticky-cta', show);
    };

    apply();
    mobile.addEventListener('change', apply);
    const ro = el && typeof ResizeObserver !== 'undefined' ? new ResizeObserver(apply) : null;
    if (el && ro) ro.observe(el);

    return () => {
      mobile.removeEventListener('change', apply);
      ro?.disconnect();
      root.style.setProperty('--sticky-cta-height', '0px');
      root.classList.remove('has-sticky-cta');
    };
  }, [visible, mounted]);

  if (!mounted) return null;

  return createPortal(
    <div
      ref={ref}
      aria-hidden={!visible}
      inert={!visible}
      className={`sticky-cta ${visible ? 'is-visible' : ''}`}
    >
      <div className="sticky-cta__inner">
        <OpenDrawerButton location="sticky" className="btn-hero-ghost sticky-cta__btn" magnetic={false}>
          {t('ctaTalk')}
        </OpenDrawerButton>
        <a
          href={whatsappUrl(whatsappNumber, FAB_MESSAGE)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={tFab('label')}
          onClick={() => track('whatsapp_click', { location: 'sticky' })}
          className="sticky-cta__wa glass btn-fx wa-ping"
        >
          <WhatsAppIcon className="h-6 w-6" />
        </a>
      </div>
    </div>,
    document.body,
  );
}
