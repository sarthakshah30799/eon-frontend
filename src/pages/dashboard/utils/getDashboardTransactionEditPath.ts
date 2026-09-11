import { TransactionTypeProfileEnum } from '@/modules/transactions';
import {
  getPurchasePageBasePath,
  getPurchasePageSlugFromType,
  type PurchasePageType,
} from '@/pages/purchase/[slug]';

const normalizeTransactionSlug = (slug?: string | null): string =>
  String(slug ?? '')
    .trim()
    .toUpperCase()
    .replace(/-/g, '_');

export const getDashboardTransactionEditPath = (txn: {
  id: string;
  slug?: string | null;
}): string | null => {
  const normalizedSlug = normalizeTransactionSlug(txn.slug);
  if (!txn.id || !normalizedSlug) {
    return null;
  }

  if (normalizedSlug === TransactionTypeProfileEnum.FAKE_CURRENCY) {
    return `/fake-currencies/edit/${txn.id}`;
  }

  const pageType = normalizedSlug as PurchasePageType;
  const urlSlug = getPurchasePageSlugFromType(pageType);
  if (!urlSlug || urlSlug === 'fake-currencies') {
    return null;
  }

  return `/${getPurchasePageBasePath(pageType)}/${urlSlug}/edit/${txn.id}`;
};
