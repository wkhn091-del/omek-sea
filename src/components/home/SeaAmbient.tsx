import type { ReactNode } from 'react';
import { OceanBoot } from '@/components/home/OceanBoot';

type SeaAmbientProps = {
  children: ReactNode;
  /** Camera depth in metres (negative = underwater). */
  level?: number;
  mood?: 'day' | 'sunset' | 'night' | 'storm';
  label?: string;
};

/**
 * Live ocean behind inner pages (about, works…) — one fixed depth, no dive stops.
 */
export function SeaAmbient({
  children,
  level = -36,
  mood = 'night',
  label = 'עמוד מתחת למים',
}: SeaAmbientProps) {
  return (
    <>
      <OceanBoot />
      <section
        className="fx-ocean sea-ambient relative isolate"
        data-mood={mood}
        data-level={String(level)}
        aria-label={label}
      >
        <div className="fx-ocean__stop sea-ambient__stop ocean-stop--section" data-level={String(level)} data-pitch="2">
          <div className="sea-ambient__content">{children}</div>
        </div>
      </section>
    </>
  );
}
