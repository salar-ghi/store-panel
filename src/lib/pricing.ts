// Effective display price for a product based on its pricing strategy
// across active stock batches.
//
//   fifo    → price of the oldest batch with remaining stock
//   latest  → price of the newest batch (default if no strategy set)
//   average → weighted average across remaining stock

import { Product } from '@/types/product';
import { StockInput } from '@/types/inventory-input';

export type PricingStrategy = 'fifo' | 'latest' | 'average';

export const PricingStrategyLabels: Record<PricingStrategy, string> = {
  fifo: 'اولین ورودی، اولین خروج (FIFO)',
  latest: 'آخرین قیمت',
  average: 'میانگین وزنی',
};

export function getEffectivePrice(
  product: Pick<Product, 'pricingStrategy' | 'price'> & Record<string, unknown>,
  batches: StockInput[] = [],
): number {
  const strategy: PricingStrategy = (product.pricingStrategy as PricingStrategy) || 'fifo';
  const active = batches
    .filter((b) => b.quantity - (b.soldQuantity ?? 0) > 0)
    .sort(
      (a, b) =>
        new Date(a.receivedDate).getTime() - new Date(b.receivedDate).getTime(),
    );

  if (active.length === 0) return product.price ?? 0;

  if (strategy === 'fifo') return active[0].salePrice;
  if (strategy === 'latest') return active[active.length - 1].salePrice;

  // weighted average
  const totals = active.reduce(
    (acc, b) => {
      const remaining = b.quantity - (b.soldQuantity ?? 0);
      acc.qty += remaining;
      acc.value += remaining * b.salePrice;
      return acc;
    },
    { qty: 0, value: 0 },
  );
  return totals.qty > 0 ? Math.round(totals.value / totals.qty) : product.price ?? 0;
}
