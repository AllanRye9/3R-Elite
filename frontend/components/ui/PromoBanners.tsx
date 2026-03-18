import Link from 'next/link';

interface Banner {
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  emoji: string;
  bg: string;
  cities: string;
  flag: string;
}

const banners: Banner[] = [
  {
    title: 'UAE Marketplace',
    subtitle: 'Discover exclusive listings across the Emirates',
    cta: 'Explore UAE',
    href: '/listings?country=UAE',
    emoji: '🏙️',
    flag: '🇦🇪',
    bg: 'from-[#0284c7] to-[#0369a1]',
    cities: 'Dubai · Abu Dhabi · Sharjah · Ajman',
  },
  {
    title: 'Uganda Marketplace',
    subtitle: 'Explore curated collections from sellers across Uganda',
    cta: 'Explore Uganda',
    href: '/listings?country=UGANDA',
    emoji: '🌿',
    flag: '🇺🇬',
    bg: 'from-[#0369a1] to-[#075985]',
    cities: 'Kampala · Jinja · Gulu · Mbarara',
  },
];

export default function PromoBanners() {
  return (
    <section className="grid grid-cols-1 xs:grid-cols-2 gap-3 xs:gap-4">
      {banners.map((banner) => (
        <Link
          key={banner.title}
          href={banner.href}
          className={`group relative overflow-hidden rounded-xl p-5 sm:p-6 bg-gradient-to-br ${banner.bg} text-white hover:shadow-2xl transition-all duration-300 interactive`}
        >
          {/* Reflective gold glow top-right */}
          <div
            className="absolute -top-6 -right-6 w-36 xs:w-44 h-36 xs:h-44 bg-elite-gold/20 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500"
            aria-hidden="true"
          />
          {/* Subtle bottom highlight */}
          <div
            className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-elite-gold/60 via-elite-gold to-elite-gold/60"
            aria-hidden="true"
          />
          <div
            className="absolute bottom-0 left-0 w-28 h-28 bg-white/5 rounded-full blur-xl"
            aria-hidden="true"
          />

          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-3xl xs:text-4xl" aria-hidden="true">{banner.flag}</span>
              <span className="text-2xl xs:text-3xl" aria-hidden="true">{banner.emoji}</span>
            </div>
            <h3 className="text-lg xs:text-xl sm:text-2xl font-extrabold mb-1 text-white">{banner.title}</h3>
            <p className="text-white/90 text-xs xs:text-sm font-medium mb-1">{banner.cities}</p>
            <p className="text-white/70 text-xs mb-4 hidden sm:block">{banner.subtitle}</p>

            <div className="inline-flex items-center gap-2 text-xs xs:text-sm font-bold bg-white/15 hover:bg-white/25 border border-white/30 text-white px-3 xs:px-4 py-1.5 xs:py-2 rounded-full transition-colors group-hover:border-elite-gold/60">
              <span className="text-elite-gold-light">✦</span>
              {banner.cta}
              <svg className="w-3.5 h-3.5 xs:w-4 xs:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>
      ))}
    </section>
  );
}
