import { SearchBar } from '@/components/listings/SearchBar';
import { CategoryNav } from '@/components/listings/CategoryNav';
import { ListingGrid } from '@/components/listings/ListingGrid';
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
      {/* Hero */}
      <section className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Buy &amp; Sell Anything in UAE &amp; Uganda
          </h1>
          <p className="text-xl mb-8 text-orange-100">
            Millions of listings. Find the best deals near you.
          </p>
          <SearchBar className="max-w-2xl mx-auto" />
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-10 space-y-10">
        {/* Categories */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-5">Browse Categories</h2>
          <CategoryNav categories={categories} />
        </section>

        {/* Featured Listings */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-bold text-gray-900">Latest Listings</h2>
            <a href="/listings" className="text-orange-600 hover:underline text-sm font-medium">View all →</a>
          </div>
          <ListingGrid listings={listings} />
        </section>

        {/* Country CTA */}
        <section className="grid md:grid-cols-2 gap-6">
          <a href="/listings?country=UAE" className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-8 hover:from-green-600 hover:to-green-700 transition-all">
            <div className="text-4xl mb-3">🇦🇪</div>
            <h3 className="text-2xl font-bold mb-1">UAE Market</h3>
            <p className="text-green-100">Discover listings across Dubai, Abu Dhabi, Sharjah and more</p>
          </a>
          <a href="/listings?country=UGANDA" className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl p-8 hover:from-yellow-600 hover:to-yellow-700 transition-all">
            <div className="text-4xl mb-3">🇺🇬</div>
            <h3 className="text-2xl font-bold mb-1">Uganda Market</h3>
            <p className="text-yellow-100">Browse deals in Kampala, Jinja, Gulu and beyond</p>
          </a>
        </section>
      </div>
    </div>
  );
}
