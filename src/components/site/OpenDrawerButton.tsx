'use client';

import type { ReactNode } from 'react';
import { track } from '@/lib/analytics';
import type { LeadSiteType } from '@/lib/content/types';
import { useSession } from '@/lib/store/visitor';

export function OpenDrawerButton({
  children,
  siteType = null,
  className = 'btn-primary',
  location,
  id,
  magnetic = true,
}: {
  children: ReactNode;
  siteType?: LeadSiteType | null;
  className?: string;
  location: string;
  id?: string;
  magnetic?: boolean;
}) {
  const openDrawer = useSession((s) => s.openDrawer);
  const magnet = /\bfx-magnet\b|\bbtn-sea\b/.test(className);

  return (
    <button
      id={id}
      type="button"
      className={className}
      aria-haspopup="dialog"
      data-magnetic={magnetic ? '' : undefined}
      onClick={() => {
        track('cta_click', { location });
        openDrawer(siteType);
      }}
    >
      {magnet ? (
        <>
          <span className="fx-magnet__label">{children}</span>
          <span className="fx-magnet__over" aria-hidden="true">
            <span className="fx-magnet__label">{children}</span>
          </span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
