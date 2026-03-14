import Link from 'next/link';

interface Banner {
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  emoji: string;
  color: string;
  cities: string;
}

const banners: Banner[] = [
  {
    title: 'UAE Marketplace',
    subtitle: 'Discover exclusive listings across the Emirates',
    cta: 'Explore UAE',
    href: '/listings?country=UAE',
    emoji: '🇦🇪',
    color: 'from-elite-navy to-elite-charcoal',
    cities: 'Dubai · Abu Dhabi · Sharjah · Ajman',
  },
  {
    title: 'Uganda Marketplace',
    subtitle: 'Explore curated collections from sellers across Uganda',
    cta: 'Explore Uganda',
    href: '/listings?country=UGANDA',
    emoji: '🇺🇬',
    color: 'from-elite-charcoal to-elite-navy',
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
          className={`group relative overflow-hidden rounded-lg xs:rounded-xl p-4 xs:p-5 sm:p-6 bg-gradient-to-br ${banner.color} text-white hover:shadow-xl transition-all duration-300 interactive`}
        >
          {/* Decorative glow blob */}
          <div
            className="absolute -top-8 -right-8 w-32 xs:w-40 h-32 xs:h-40 bg-elite-gold/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500"
            aria-hidden="true"
          />
          <div
            className="absolute bottom-0 left-0 w-24 h-24 bg-elite-gold/5 rounded-full blur-xl"
            aria-hidden="true"
          />

          <div className="relative">
            <div
              className="text-3xl xs:text-4xl mb-2 xs:mb-3 inline-block group-hover:scale-110 transition-transform duration-300"
              aria-hidden="true"
            >
              {banner.emoji}
            </div>
            <h3 className="text-base xs:text-lg sm:text-xl font-extrabold mb-0.5 xs:mb-1">{banner.title}</h3>
            <p className="text-white/80 text-[10px] xs:text-xs sm:text-sm mb-1 xs:mb-1.5">{banner.cities}</p>
            <p className="text-white/70 text-[9px] xs:text-[10px] mb-3 xs:mb-4 hidden sm:block">{banner.subtitle}</p>

            <div className="inline-flex items-center gap-1.5 text-[10px] xs:text-xs font-bold bg-elite-gold/20 hover:bg-elite-gold/30 border border-elite-gold/30 text-elite-gold px-2.5 xs:px-3 py-1 xs:py-1.5 rounded-full transition-colors">
              {banner.cta}
              <svg className="w-3 h-3 xs:w-3.5 xs:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>
      ))}
    </section>
  );
}
