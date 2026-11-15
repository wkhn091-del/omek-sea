'use client';

import { useEffect, useState } from 'react';
import { setOceanMood } from '@/lib/audio/ocean-sea';
import { getLockedSeaMood, isSeaMood, lockSeaMood, type SeaMood } from '@/lib/sea-mood';

const MOODS: { id: SeaMood; label: string }[] = [
  { id: 'day', label: 'יום' },
  { id: 'sunset', label: 'שקיעה' },
  { id: 'night', label: 'לילה' },
  { id: 'storm', label: 'סערה' },
];

/** Same control as the ocean kit — pick locks until another pick. */
export function SeaMoodSwitcher({ className = '' }: { className?: string }) {
  const [mood, setMood] = useState<SeaMood>('sunset');

  useEffect(() => {
    const sync = (next: string) => {
      if (isSeaMood(next)) setMood(next);
    };

    const fromDom = () => {
      const locked = getLockedSeaMood();
      if (locked) {
        sync(locked);
        return;
      }
      const sea = document.querySelector<HTMLElement>('.fx-ocean');
      sync(sea?.fxOcean?.mood || sea?.dataset.mood || document.documentElement.dataset.seaMood || 'sunset');
    };
    fromDom();

    const onMood = (e: Event) => {
      const locked = getLockedSeaMood();
      sync(locked || (e as CustomEvent<{ mood: string }>).detail.mood);
    };
    const seas = [...document.querySelectorAll<HTMLElement>('.fx-ocean')];
    seas.forEach((sea) => sea.addEventListener('fx:ocean-mood', onMood));
    return () => seas.forEach((sea) => sea.removeEventListener('fx:ocean-mood', onMood));
  }, []);

  const pick = (id: SeaMood) => {
    setMood(id);
    lockSeaMood(id);
    setOceanMood(id);
  };

  return (
    <div className={`sea-moods ${className}`.trim()} role="group" aria-label="מצב אור">
      {MOODS.map((m) => (
        <button
          key={m.id}
          type="button"
          data-set-mood={m.id}
          aria-pressed={mood === m.id}
          onClick={() => pick(m.id)}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
