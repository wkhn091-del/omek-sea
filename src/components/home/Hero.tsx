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
          <OpenDrawerButton id="hero-cta" location="hero" className="btn-hero-ghost" magnetic={false}>
            {t('common.ctaTalk')}
          </OpenDrawerButton>
        </div>
      </div>
    </div>
  );
}
