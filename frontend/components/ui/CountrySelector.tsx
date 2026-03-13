'use client';

import { useCountry } from '@/context/CountryContext';

export function CountrySelector() {
  const { country, setCountry } = useCountry();

  return (
    <select
      value={country}
      onChange={(e) => setCountry(e.target.value as 'UAE' | 'UGANDA')}
      className="border border-gray-300 rounded-lg px-2 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
    >
      <option value="UAE">🇦🇪 UAE</option>
      <option value="UGANDA">🇺🇬 Uganda</option>
    </select>
  );
}
