import { getTranslations } from 'next-intl/server';
import { OpenDrawerButton } from '@/components/site/OpenDrawerButton';
import type { HomePage } from '@/lib/content/types';

/** First ocean stop only — opening copy above the water. */
export async function HeroOpening({ hero }: { hero: HomePage['hero'] }) {
  const t = await getTranslations();

  return (
    <div className="fx-ocean__stop stop stop--hero" data-level="3.2" data-pitch="-4">
      <div className="stop__text">
        <h1 id="hero-title" className="whitespace-pre-line">
          {hero.title}
        </h1>
        <p>{hero.lead}</p>
        <div className="stop__actions sea-cta-row">
          <OpenDrawerButton id="hero-cta" location="hero" className="btn-primary btn-sea fx-magnet">
            {t('common.ctaTalk')}
          </OpenDrawerButton>
          <button
            type="button"
            className="sea-cta-round"
            data-ocean-dive=""
            data-magnetic=""
            aria-label={t('hero.scroll')}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 4v14M5 13l7 7 7-7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
      <p className="scroll-hint" aria-hidden="true">
        <i />
        {t('hero.scroll')} כדי לצלול
      </p>
    </div>
  );
}
