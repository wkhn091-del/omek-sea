'use client';

import type { CSSProperties } from 'react';
import { useTranslations } from 'next-intl';
import { Reveal } from '@/components/Reveal';
import { SplitText } from '@/components/SplitText';

/**
 * Fit check as pressure: light glass near the surface, darker burnt glass in the deep.
 */
export function FitCheck({ eyebrow }: { eyebrow: string }) {
  const t = useTranslations('fit');
  const yes = t.raw('yes') as string[];
  const no = t.raw('no') as string[];

  return (
    <section id="fit" aria-labelledby="fit-title" className="fit-depths relative overflow-hidden py-10 md:py-14">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <p className="eyebrow text-lake/80">{eyebrow}</p>
        <h2 id="fit-title" className="mt-5 max-w-3xl text-5xl font-light text-pearl md:text-7xl">
          <SplitText text={t('title')} />
        </h2>

        <div className="relative mt-10 space-y-10 md:mt-14 md:space-y-14">
          <Reveal className="fit-depths__above">
            <p className="font-display text-2xl text-pearl md:text-3xl">{t('yesTitle')}</p>
            <ul className="mt-5 grid gap-3 md:mt-6 md:gap-4">
              {yes.map((item, i) => (
                <li key={item} className="depth-card depth-card--shallow" style={{ '--card-i': i } as CSSProperties}>
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={80} className="fit-depths__below">
            <p className="font-display text-2xl text-pearl/90 md:text-3xl">{t('noTitle')}</p>
            <ul className="mt-5 grid gap-3 md:mt-6 md:gap-4">
              {no.map((item, i) => (
                <li key={item} className="depth-card depth-card--deep" style={{ '--card-i': i } as CSSProperties}>
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
