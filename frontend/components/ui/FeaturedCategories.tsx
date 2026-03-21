import Link from 'next/link';

interface FeaturedCat {
  label: string;
  icon: string;
  color: string;
  href: string;
  desc: string;
}

const featuredCats: FeaturedCat[] = [
  {
    label: 'Fine Timepieces',
    icon: '⌚',
    color: 'from-violet-600 to-purple-700',
    href: '/listings?q=watches',
    desc: 'Luxury watches & clocks',
  },
  {
    label: 'Designer Apparel',
    icon: '👔',
    color: 'from-rose-500 to-pink-700',
    href: '/listings?q=fashion',
    desc: 'Premium clothing & style',
  },
  {
    label: 'Tech Innovations',
    icon: '💻',
    color: 'from-cyan-500 to-sky-700',
    href: '/listings?q=electronics',
    desc: 'Cutting-edge technology',
  },
  {
    label: 'Bespoke Home',
    icon: '🏡',
    color: 'from-emerald-500 to-teal-700',
    href: '/listings?q=home',
    desc: 'Curated living spaces',
  },
  {
    label: 'Luxury Vehicles',
    icon: '🚗',
    color: 'from-orange-500 to-red-600',
    href: '/listings?q=vehicles',
    desc: 'Premium automobiles',
  },
  {
    label: 'Fine Jewellery',
    icon: '💎',
    color: 'from-amber-500 to-yellow-600',
    href: '/listings?q=jewellery',
    desc: 'Exquisite adornments',
  },
  {
    label: 'Art & Collectibles',
    icon: '🎨',
    color: 'from-indigo-500 to-blue-700',
    href: '/listings?q=art',
    desc: 'Rare finds & originals',
  },
  {
    label: 'Premium Services',
    icon: '✦',
    color: 'from-fuchsia-500 to-violet-600',
    href: '/listings?q=services',
    desc: 'Elite-grade assistance',
  },
];

export default function FeaturedCategories() {
  return (
    <section className="animate-fade-up">
      <div className="flex items-center justify-between mb-3 xs:mb-4">
        <div>
          <h2 className="text-lg xs:text-xl font-extrabold text-elite-navy">Premium Collections</h2>
          <p className="text-xs xs:text-sm text-gray-500 mt-0.5">Curated categories for the discerning buyer</p>
        </div>
        <Link
          href="/listings"
          className="text-xs xs:text-sm font-semibold text-elite-gold hover:text-elite-gold-dark flex items-center gap-1 interactive"
        >
          Browse all
          <svg className="w-3.5 h-3.5 xs:w-4 xs:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 xs:gap-3 stagger-children">
        {featuredCats.map((cat) => (
          <Link
            key={cat.label}
            href={cat.href}
            className={`group relative overflow-hidden rounded-lg xs:rounded-xl p-3 xs:p-4 bg-gradient-to-br ${cat.color} text-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 interactive`}
          >
            {/* Decorative glow */}
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full" aria-hidden="true" />

            <div
              className="text-2xl xs:text-3xl mb-1.5 xs:mb-2 group-hover:scale-110 transition-transform duration-300 inline-block drop-shadow"
              aria-hidden="true"
            >
              {cat.icon}
            </div>
            <h3 className="font-bold text-xs xs:text-sm leading-tight">{cat.label}</h3>
            <p className="text-[8px] xs:text-[9px] opacity-80 leading-tight mt-0.5 hidden xs:block">{cat.desc}</p>

            {/* Arrow */}
            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
