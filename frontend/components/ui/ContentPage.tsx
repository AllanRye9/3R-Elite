import Link from 'next/link';

type ContentSection = {
  title: string;
  body: string[];
};

type ContentPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: ContentSection[];
  ctaHref?: string;
  ctaLabel?: string;
};

export function ContentPage({
  eyebrow,
  title,
  intro,
  sections,
  ctaHref,
  ctaLabel,
}: ContentPageProps) {
  const isExternalCta = ctaHref ? /^(mailto:|https?:)/.test(ctaHref) : false;

  return (
    <div className="bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.08),_transparent_38%),linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)]">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="rounded-[2rem] border border-sky-100 bg-white/90 p-8 shadow-[0_25px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-10">
          <span className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
            {eyebrow}
          </span>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-elite-navy sm:text-5xl">{title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">{intro}</p>

          <div className="mt-10 space-y-8">
            {sections.map((section) => (
              <section key={section.title} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-6">
                <h2 className="text-lg font-bold text-slate-900 sm:text-xl">{section.title}</h2>
                <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600 sm:text-base">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {ctaHref && ctaLabel && (
            <div className="mt-10 flex flex-wrap gap-3">
              {isExternalCta ? (
                <a
                  href={ctaHref}
                  className="inline-flex items-center justify-center rounded-xl bg-elite-navy px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-sky-700"
                >
                  {ctaLabel}
                </a>
              ) : (
                <Link
                  href={ctaHref}
                  className="inline-flex items-center justify-center rounded-xl bg-elite-navy px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-sky-700"
                >
                  {ctaLabel}
                </Link>
              )}
              <Link
                href="/listings"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Browse listings
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}