'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import { SeaMoodSwitcher } from '@/components/home/SeaMoodSwitcher';
import { SoundToggle } from '@/components/motion/SoundToggle';
import { Logo } from './Logo';
import { OpenDrawerButton } from './OpenDrawerButton';

/** Transparent over the hero, glass once scrolled; slides away while reading down and returns on the way up. */
export function Header() {
  const t = useTranslations();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuId = useId();

  // Close the mobile menu after navigating.
  const [menuPath, setMenuPath] = useState(pathname);
  if (pathname !== menuPath) {
    setMenuPath(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      setScrolled(y > 24);
      if (Math.abs(y - lastY) > 6) {
        setHidden(y > lastY && y > 320);
        lastY = y;
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const links = [
    { href: '/projects', label: t('nav.works') },
    { href: '/#services', label: t('nav.services') },
    { href: '/about', label: t('nav.about') },
    { href: '/#faq', label: t('nav.faq') },
  ];
  const solid = scrolled || menuOpen;

  const drawer =
    mounted &&
    createPortal(
      <>
        <div
          className={`site-drawer-scrim md:hidden ${menuOpen ? 'is-open' : ''}`}
          aria-hidden={!menuOpen}
          onClick={() => setMenuOpen(false)}
        />
        <nav
          id={menuId}
          aria-label={t('nav.label')}
          className={`site-drawer md:hidden ${menuOpen ? 'is-open' : ''}`}
          inert={!menuOpen}
        >
          <ul className="site-drawer__links">
            {links.map((link, i) => (
              <li key={link.href} className="rise-in" style={{ '--rise-delay': `${i * 70}ms` } as React.CSSProperties}>
                <Link
                  href={link.href}
                  className="flex items-baseline gap-4 border-b border-pearl/[0.1] py-5 font-display text-3xl font-light"
                  onClick={() => setMenuOpen(false)}
                >
                  <bdi className="text-sm text-gold">{String(i + 1).padStart(2, '0')}</bdi>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-auto flex flex-col gap-4 pt-6">
            <SeaMoodSwitcher className="flex w-full justify-between" />
            <OpenDrawerButton location="menu" className="btn-hero-ghost w-full" magnetic={false}>
              {t('common.ctaTalk')}
            </OpenDrawerButton>
          </div>
        </nav>
      </>,
      document.body,
    );

  return (
    <>
      <header
        className={`sticky top-0 transition-[transform,opacity,background-color,border-color] duration-700 ease-[var(--ease-out)] motion-reduce:transition-none ${
          menuOpen ? 'z-[55]' : 'z-40'
        } ${
          hidden && !menuOpen ? '-translate-y-full opacity-0 focus-within:translate-y-0 focus-within:opacity-100' : 'translate-y-0'
        } ${solid ? 'border-b border-pearl/[0.08] bg-abyss/70 backdrop-blur-xl' : 'border-b border-transparent'}`}
      >
        <div className="mx-auto flex h-[var(--header-height)] max-w-7xl items-center justify-between gap-4 px-5 md:px-10">
          <Link href="/" className="flex items-center gap-3 text-pearl" aria-label={t('common.logoAlt')} data-magnetic="">
            <Logo className="h-10 w-10" />
            <span className="font-display text-2xl tracking-[0.12em]">{t('common.brand')}</span>
          </Link>

          <nav aria-label={t('nav.label')} className="hidden md:block">
            <ul className="flex items-center gap-9 text-[15px] tracking-wide">
              {links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="link link-reveal text-pearl/85" aria-current={pathname === link.href ? 'page' : undefined}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex min-w-0 shrink items-center gap-1 sm:gap-3">
            <SeaMoodSwitcher className="hidden md:flex" />
            <SoundToggle />
            <OpenDrawerButton location="header" className="btn-primary btn-sea fx-magnet hidden !min-h-11 !px-5 text-sm sm:inline-flex">
              {t('common.ctaTalk')}
            </OpenDrawerButton>
            <button
              type="button"
              className="relative z-[60] inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full md:hidden"
              aria-expanded={menuOpen}
              aria-controls={menuId}
              aria-label={menuOpen ? t('nav.menuClose') : t('nav.menuOpen')}
              suppressHydrationWarning
              onClick={() => setMenuOpen((open) => !open)}
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 9h16M8 15h12" />}
              </svg>
            </button>
          </div>
        </div>
      </header>
      {drawer}
    </>
  );
}
