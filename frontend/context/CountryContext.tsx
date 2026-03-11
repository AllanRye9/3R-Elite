'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Country, Currency } from '@/lib/types';
import { getCurrency, getLocations } from '@/lib/utils';

interface CountryContextType {
  country: Country;
  currency: Currency;
  locations: string[];
  setCountry: (c: Country) => void;
}

const CountryContext = createContext<CountryContextType | undefined>(undefined);

export function CountryProvider({ children }: { children: React.ReactNode }) {
  const [country, setCountryState] = useState<Country>('UAE');

  useEffect(() => {
    const saved = localStorage.getItem('selectedCountry') as Country;
    if (saved === 'UAE' || saved === 'UGANDA') setCountryState(saved);
  }, []);

  const setCountry = (c: Country) => {
    setCountryState(c);
    localStorage.setItem('selectedCountry', c);
  };

  return (
    <CountryContext.Provider value={{
      country,
      currency: getCurrency(country),
      locations: getLocations(country),
      setCountry,
    }}>
      {children}
    </CountryContext.Provider>
  );
}

export function useCountry() {
  const ctx = useContext(CountryContext);
  if (!ctx) throw new Error('useCountry must be used within CountryProvider');
  return ctx;
}
