import type { CardTransferFormValues, CardTransferItem } from '../types';

export const demoCards = [
  { id: 'card-001', series: 'CC0001', kitNumber: 'KIT-001', maskedCardNumber: '1234XXXXXXXX3456', currencyCode: 'USD', productCode: 'CC', issuerName: 'Demo Card Issuer', denomination: '100', amount: '100.00', expirationDate: '31/12/2030' },
  { id: 'card-002', series: 'CC0002', kitNumber: 'KIT-001', maskedCardNumber: '1234XXXXXXXX7890', currencyCode: 'USD', productCode: 'CC', issuerName: 'Demo Card Issuer', denomination: '50', amount: '50.00', expirationDate: '31/12/2030' },
  { id: 'card-003', series: 'CC0003', kitNumber: 'KIT-002', maskedCardNumber: '9876XXXX5432', currencyCode: 'EUR', productCode: 'CC', issuerName: 'Demo Card Issuer', denomination: '25', amount: '25.00', expirationDate: '30/06/2031' },
];

export const emptyTransferItem = (): CardTransferItem => ({
  currencyId: '', per: '1', productId: '', issuerPartyProfileId: '', feAmount: '0.00', cards: [],
});

export const emptyTransferForm = (): CardTransferFormValues => ({
  transferType: 'SELL', sourceBranchId: '', sourceCounterId: '', destinationBranchId: '', transactionDate: '',
  sellTransactionNumber: '', purchaseTransactionNumber: '', remarks: '', items: [emptyTransferItem()],
});

export const formatTransferDate = (value: string) => {
  if (!value) return '—';
  const [year, month, day] = value.slice(0, 10).split('-');
  return year && month && day ? `${day}/${month}/${year}` : value;
};

export const calculateItemAmount = (item: CardTransferItem) => item.cards.reduce((sum, card) => sum + Number(card.amount || 0), 0).toFixed(2);

export const calculateTotalAmount = (items: CardTransferItem[]) => items.reduce((sum, item) => sum + Number(calculateItemAmount(item)), 0).toFixed(2);
