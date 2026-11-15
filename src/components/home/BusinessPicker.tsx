import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

type Choice = { label: string; href: string };

/** One tap from "what business do I have" to the build closest to it. Desktop: locked grid, no orphan pills. */
export async function BusinessPicker() {
  const t = await getTranslations('home.picker');
  const choices = t.raw('choices') as Choice[];

  return (
    <nav aria-labelledby="picker-title" className="relative py-10 md:py-14">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <h2 id="picker-title" className="font-display text-3xl font-light md:text-4xl">
          {t('title')}
        </h2>
        <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {choices.map((choice) => (
            <li key={choice.href} className="min-w-0">
              <Link href={choice.href} className="btn-chip w-full justify-between">
                <span className="min-w-0 text-start">{choice.label}</span>
                <span className="btn-chip__arrow" aria-hidden="true">
                  ←
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
