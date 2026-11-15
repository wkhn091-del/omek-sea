/** Manual mood pick locks lighting so dive-stop data-mood cannot override it. */

export type SeaMood = 'day' | 'sunset' | 'night' | 'storm';

const MOODS: SeaMood[] = ['day', 'sunset', 'night', 'storm'];

let locked: SeaMood | null = null;
let reinstate = false;

export function isSeaMood(value: string | null | undefined): value is SeaMood {
  return !!value && (MOODS as string[]).includes(value);
}

export function getLockedSeaMood(): SeaMood | null {
  return locked;
}

export function applySeaMood(mood: SeaMood, instant = true) {
  document.documentElement.dataset.seaMood = mood;
  document.querySelectorAll<HTMLElement>('.fx-ocean').forEach((sea) => {
    sea.dataset.mood = mood;
    sea.fxOcean?.setMood(mood, instant);
  });
}

/** User picked a mood in the switcher — stick to it while scrolling. */
export function lockSeaMood(mood: SeaMood) {
  locked = mood;
  document.documentElement.dataset.seaMoodLock = '1';
  applySeaMood(mood, true);
}

/** Dive-stop or ocean.js tried to change mood. Returns the mood that should be shown. */
export function reconcileSeaMood(incoming: string): SeaMood | null {
  if (!isSeaMood(incoming)) return locked;

  if (!locked) {
    document.documentElement.dataset.seaMood = incoming;
    return incoming;
  }

  if (incoming === locked) {
    document.documentElement.dataset.seaMood = locked;
    return locked;
  }

  if (reinstate) return locked;
  reinstate = true;
  applySeaMood(locked, true);
  queueMicrotask(() => {
    reinstate = false;
  });
  return locked;
}
