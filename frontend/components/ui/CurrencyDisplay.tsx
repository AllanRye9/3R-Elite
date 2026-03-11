import { formatCurrency } from '@/lib/utils';
import { Currency } from '@/lib/types';

interface Props {
  amount: number;
  currency: Currency;
  className?: string;
}

export function CurrencyDisplay({ amount, currency, className = '' }: Props) {
  return <span className={className}>{formatCurrency(amount, currency)}</span>;
}
