import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(amount: number, currency: 'AED' | 'UGX' | 'KES' | 'CNY'): string {
  if (currency === 'AED') {
    return `AED ${amount.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (currency === 'KES') {
    return `KES ${Math.round(amount).toLocaleString('en-KE')}`;
  }
  if (currency === 'CNY') {
    return `¥ ${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `UGX ${Math.round(amount).toLocaleString('en-UG')}`;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export function timeAgo(date: string | Date): string {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return formatDate(date);
}

export const UAE_LOCATIONS = [
  'Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah',
  'Fujairah', 'Umm Al Quwain', 'Al Ain',
];

export const UGANDA_LOCATIONS = [
  'Kampala', 'Jinja', 'Gulu', 'Mbarara', 'Masaka',
  'Entebbe', 'Lira', 'Mbale', 'Mukono', 'Soroti',
];

export const KENYA_LOCATIONS = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret',
  'Nyeri', 'Meru', 'Malindi', 'Thika', 'Machakos',
];

export const CHINA_LOCATIONS = [
  'Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen', 'Chengdu',
  'Hangzhou', 'Wuhan', 'Xian', 'Nanjing', 'Tianjin',
];

export function getLocations(country: 'UAE' | 'UGANDA' | 'KENYA' | 'CHINA'): string[] {
  if (country === 'UAE') return UAE_LOCATIONS;
  if (country === 'UGANDA') return UGANDA_LOCATIONS;
  if (country === 'KENYA') return KENYA_LOCATIONS;
  return CHINA_LOCATIONS;
}

export function getCurrency(country: 'UAE' | 'UGANDA' | 'KENYA' | 'CHINA'): 'AED' | 'UGX' | 'KES' | 'CNY' {
  if (country === 'UAE') return 'AED';
  if (country === 'UGANDA') return 'UGX';
  if (country === 'KENYA') return 'KES';
  return 'CNY';
}
