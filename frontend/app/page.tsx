import Link from 'next/link';
import { CategoryNav } from '@/components/listings/CategoryNav';
import { ListingGrid } from '@/components/listings/ListingGrid';
import { HeroSlideshow } from '@/components/ui/HeroSlideshow';
import type { Category } from '@/lib/types';

async function getHomeData() {
  try {
    const [catRes, listingRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/categories`, { next: { revalidate: 3600 } }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/listings?limit=8&sort=createdAt`, { next: { revalidate: 60 } }),
    ]);
    const categories: Category[] = catRes.ok ? await catRes.json() : [];
    const listingData = listingRes.ok ? await listingRes.json() : { listings: [] };
    return { categories, listings: listingData.listings || [] };
  } catch {
    return { categories: [], listings: [] };
  }
}

export default async function HomePage() {
  const { categories, listings } = await getHomeData();

  return (
    <div>
      {/* Hero - compact with text + slideshow */}
      <section className="bg-gradient-to-r from-sky-500 to-sky-600 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Buy &amp; Sell Anything in UAE &amp; Uganda
          </h1>
          <p className="text-sm mb-2 text-sky-100">
            Millions of listings. Find the best deals near you.
          </p>
          <HeroSlideshow />
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-4 space-y-5">
        {/* Categories */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Browse Categories</h2>
          <CategoryNav categories={categories} />
        </section>

        {/* Featured Listings */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900">Latest Listings</h2>
            <Link href="/listings" className="text-sky-600 hover:underline text-sm font-medium">View all →</Link>
          </div>
          <ListingGrid listings={listings} />
        </section>

        {/* Country CTA */}
        <section className="grid md:grid-cols-2 gap-4">
          <Link href="/listings?country=UAE" className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-5 hover:from-green-600 hover:to-green-700 transition-all">
            <div className="text-2xl mb-1">🇦🇪</div>
            <h3 className="text-lg font-bold mb-0.5">UAE Market</h3>
            <p className="text-green-100 text-sm">Discover listings across Dubai, Abu Dhabi, Sharjah and more</p>
          </Link>
          <Link href="/listings?country=UGANDA" className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg p-5 hover:from-yellow-600 hover:to-yellow-700 transition-all">
            <div className="text-2xl mb-1">🇺🇬</div>
            <h3 className="text-lg font-bold mb-0.5">Uganda Market</h3>
            <p className="text-yellow-100 text-sm">Browse deals in Kampala, Jinja, Gulu and beyond</p>
          </Link>
        </section>
      </div>
    </div>
  );
}
