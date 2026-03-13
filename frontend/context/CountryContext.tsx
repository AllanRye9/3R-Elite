'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Country, Currency } from '@/lib/types';
import { getCurrency, getLocations } from '@/lib/utils';
import { CountryPopup } from '@/components/ui/CountryPopup';

interface CountryContextType {
  country: Country;
  currency: Currency;
  locations: string[];
  setCountry: (c: Country) => void;
}

const CountryContext = createContext<CountryContextType | undefined>(undefined);

export function CountryProvider({ children }: { children: React.ReactNode }) {
  const [country, setCountryState] = useState<Country>('UAE');
  const [showPopup, setShowPopup] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('selectedCountry') as Country;
    if (saved === 'UAE' || saved === 'UGANDA') {
      setCountryState(saved);
      setReady(true);
      return;
    }

    // Try IP-based country detection
    fetch('https://ipapi.co/json/')
      .then((res) => res.json())
      .then((data) => {
        const code = data?.country_code;
        if (code === 'UG') {
          setCountryState('UGANDA');
          localStorage.setItem('selectedCountry', 'UGANDA');
        } else if (code === 'AE') {
          setCountryState('UAE');
          localStorage.setItem('selectedCountry', 'UAE');
        } else {
          setShowPopup(true);
        }
      })
      .catch(() => {
        setShowPopup(true);
      })
      .finally(() => {
        setReady(true);
      });
  }, []);

  const setCountry = (c: Country) => {
    setCountryState(c);
    localStorage.setItem('selectedCountry', c);
    setShowPopup(false);
  };

  return (
    <CountryContext.Provider value={{
      country,
      currency: getCurrency(country),
      locations: getLocations(country),
      setCountry,
    }}>
      {ready && showPopup && <CountryPopup onSelect={setCountry} />}
      {children}
    </CountryContext.Provider>
  );
}

export function useCountry() {
  const ctx = useContext(CountryContext);
  if (!ctx) throw new Error('useCountry must be used within CountryProvider');
  return ctx;
}
