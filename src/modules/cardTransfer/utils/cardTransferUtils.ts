import type { CardTransferFormValues, CardTransferItem } from '../types';

export const emptyTransferItem = (): CardTransferItem => ({
  currencyId: '', per: '1', productId: '', issuerPartyProfileId: '', feAmount: '0.00', cards: [],
});

export const emptyTransferForm = (): CardTransferFormValues => ({
  sourceBranchId: '', destinationBranchId: '', transactionDate: '', transactionNumber: '', remarks: '', items: [emptyTransferItem()],
});

export const formatTransferDate = (value: string) => {
  if (!value) return '—';
  const [year, month, day] = value.slice(0, 10).split('-');
  return year && month && day ? `${day}/${month}/${year}` : value;
};

export const calculateItemAmount = (item: CardTransferItem) => item.cards.reduce((sum, card) => sum + Number(card.amount || 0), 0).toFixed(2);

export const calculateTotalAmount = (items: CardTransferItem[]) => items.reduce((sum, item) => sum + Number(calculateItemAmount(item)), 0).toFixed(2);
