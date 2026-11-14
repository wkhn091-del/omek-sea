import type { ReactNode } from 'react';

/**
 * Continues the live ocean under the rest of the homepage —
 * flat fx-ocean at depth, so leaving the dive never snaps back to dry land.
 */
export function UnderwaterSite({ children }: { children: ReactNode }) {
  return (
    <section
      className="fx-ocean site-underwater relative isolate"
      data-mood="night"
      data-level="-70"
      aria-label="המשך האתר מתחת למים"
    >
      <div className="site-underwater__content relative z-[1]">{children}</div>
    </section>
  );
}
