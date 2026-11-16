import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import Link from 'next/link';
import { headers } from 'next/headers';
import { BusinessPicker } from '@/components/home/BusinessPicker';
import { DepthStory } from '@/components/home/DepthStory';
import { Faq } from '@/components/home/Faq';
import { FitCheck } from '@/components/home/FitCheck';
import { HeroOpening } from '@/components/home/Hero';
import { NextSteps } from '@/components/home/NextSteps';
import { OceanBoot } from '@/components/home/OceanBoot';
import { SeaLife } from '@/components/home/SeaLife';
import { ProductShowcase } from '@/components/home/ProductShowcase';
import { Proof } from '@/components/proof/Proof';
import { Services } from '@/components/home/Services';
import { SurfaceZone } from '@/components/home/SurfaceZone';
import { InlineLeadForm } from '@/components/lead/LazyLeadForm';
import { Reveal } from '@/components/Reveal';
import { SplitText } from '@/components/SplitText';
import { WorksShowcase } from '@/components/works/WorksShowcase';
import { JsonLd } from '@/components/seo/JsonLd';
import { getSiteContent } from '@/lib/content/site-content';
import { formatIsraeliPhone, toWhatsAppNumber } from '@/lib/domain/phone';
import { publicEnv } from '@/lib/env.public';
import { leadsLocked } from '@/lib/env.server';
import { businessLd, faqLd, servicesLd } from '@/lib/seo/structured-data';

const PORTRAIT_SRC: string | null = '/about/avishi.jpg';

/** One live ocean: real site sections are the dive stops (no filler copy). */
export default async function HomePage() {
  const [content, t, requestHeaders] = await Promise.all([getSiteContent(), getTranslations(), headers()]);
  const { home, settings } = content;
  const nonce = requestHeaders.get('x-nonce') ?? undefined;
  const whatsappNumber = toWhatsAppNumber(settings.whatsappE164);

  return (
    <>
      <OceanBoot />
      <SeaLife />
      <section
        id="hero"
        aria-labelledby="hero-title"
        className="fx-ocean dive relative isolate -mt-[var(--header-height)]"
        data-mood="sunset"
        data-quality="high"
        data-waves="1.35"
        data-speed="1"
        data-drift="0.55"
      >
        <HeroOpening hero={home.hero} />

        {/* Real site blocks — depth builds down the page; contact is the seabed */}
        <div className="fx-ocean__stop ocean-stop--section" data-level="-2.5" data-pitch="8">
          <WorksShowcase
            projects={content.projects}
            title={home.works.title}
            intro={home.works.intro}
            eyebrow={t('home.worksEyebrow')}
            oceanEmbed
          />
        </div>

        <div className="fx-ocean__stop ocean-stop--section" data-level="-8" data-pitch="6">
          <FitCheck eyebrow={t('home.fitEyebrow')} />
        </div>

        <div className="fx-ocean__stop ocean-stop--section" data-level="-16" data-pitch="5">
          <Proof testimonials={content.testimonials} eyebrow={t('home.proofEyebrow')} />
        </div>

        <div className="fx-ocean__stop ocean-stop--section" data-level="-28" data-pitch="4">
          <BusinessPicker />
        </div>

        <div className="fx-ocean__stop ocean-stop--section" data-level="-42" data-pitch="3">
          <Services section={home.services} services={content.services} eyebrow={t('home.servicesEyebrow')} />
        </div>

        <div className="fx-ocean__stop ocean-stop--section" data-level="-58" data-pitch="2">
          <section aria-labelledby="about-teaser-title" className="relative overflow-hidden py-10 md:py-14">
            <div className="mx-auto flex max-w-3xl flex-col items-start gap-6 px-5 md:max-w-4xl md:px-10">
              <div className="flex items-center gap-4 md:gap-5">
                {PORTRAIT_SRC ? (
                  <Reveal className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-gold/40 bg-ink shadow-[0_0_32px_rgb(4_18_31/0.55)] md:h-28 md:w-28">
                    <Image
                      src={PORTRAIT_SRC}
                      alt={t('home.portraitAlt')}
                      fill
                      sizes="112px"
                      priority
                      unoptimized
                      className="object-cover object-[50%_18%]"
                    />
                  </Reveal>
                ) : null}
                <div>
                  <p className="eyebrow">{t('home.aboutEyebrow')}</p>
                  <p className="mt-2 font-display text-xl font-light italic text-pearl/80 md:text-2xl" aria-hidden="true">
                    אבישי
                  </p>
                </div>
              </div>
              <h2 id="about-teaser-title" className="sr-only">
                {t('nav.about')}
              </h2>
              <SplitText
                as="p"
                text={home.about.text}
                className="font-display text-2xl font-light leading-snug md:text-4xl lg:text-[clamp(2rem,2.8vw,2.75rem)]"
              />
              <Reveal>
                <Link href="/about" className="link text-lg">
                  {t('about.more')}
                </Link>
              </Reveal>
            </div>
          </section>
        </div>

        <div className="fx-ocean__stop ocean-stop--section" data-level="-78" data-pitch="2">
          <SurfaceZone>
            <DepthStory depth={home.depth} eyebrow={t('home.depthEyebrow')} ctaLabel={t('common.ctaTalk')} />
            <ProductShowcase eyebrow={t('home.showcaseEyebrow')} />
          </SurfaceZone>
        </div>

        <div className="fx-ocean__stop ocean-stop--section" data-level="-105" data-pitch="1">
          <Faq
            section={home.faq}
            faqs={content.faqs}
            eyebrow={t('home.faqEyebrow')}
            contact={{
              whatsappNumber,
              phoneE164: settings.phoneE164,
              phoneDisplay: formatIsraeliPhone(settings.phoneE164),
              reply: t('about.hoursByAppointment'),
            }}
          />
        </div>

        <div className="fx-ocean__stop ocean-stop--section" data-level="-140" data-pitch="0">
          <SurfaceZone tone="sunset">
            <section id="contact" aria-labelledby="contact-title" className="relative py-28 md:py-40">
              <div className="mx-auto grid max-w-7xl gap-14 px-5 md:px-10 lg:grid-cols-[1fr_1.1fr]">
                <div className="lg:sticky lg:top-32 lg:self-start">
                  <p className="eyebrow">{t('home.contactEyebrow')}</p>
                  <h2 id="contact-title" className="mt-5 text-5xl font-light md:text-7xl">
                    <SplitText text={home.closing.title} />
                  </h2>
                  <p className="mt-6 text-lg text-mist">{t('form.title')}</p>
                  <NextSteps className="mt-12 hidden lg:block" />
                </div>
                <div className="glass glass-deep rounded-[2rem] p-6 md:p-10 lg:self-start">
                  <InlineLeadForm
                    whatsappNumber={whatsappNumber}
                    addons={content.addons}
                    nonce={nonce}
                    location="inline"
                    whatsappOnly={leadsLocked}
                  />
                </div>
                <NextSteps className="lg:hidden" />
              </div>
            </section>
          </SurfaceZone>
        </div>
      </section>

      <div className="ocean-gauge" aria-hidden="true">
        <div className="ocean-gauge__scale">
          <i className="ocean-gauge__needle" />
        </div>
        <div className="ocean-gauge__read">
          <span className="ocean-gauge__label" data-ocean-label="">
            גובה
          </span>
          <span className="ocean-gauge__value">
            <span className="ocean-gauge__num" data-ocean-num="">
              3.2
            </span>
            <span className="ocean-gauge__unit">מ׳</span>
          </span>
        </div>
      </div>

      <JsonLd
        nonce={nonce}
        data={[businessLd(settings, publicEnv.siteUrl), servicesLd(content.services, publicEnv.siteUrl), faqLd(content.faqs)]}
      />
    </>
  );
}
