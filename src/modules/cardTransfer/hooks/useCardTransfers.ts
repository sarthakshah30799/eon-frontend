import { useSyncExternalStore } from 'react';
import type { CardTransferFormValues, CardTransferRequest, CardTransferStatus } from '../types';
import { demoCards } from '../utils';

const STORAGE_KEY = 'maraekat.card-transfer.frontend-preview';
const initialRequests: CardTransferRequest[] = [{
  id: 'demo-transfer-001', transferType: 'SELL', sourceBranchId: 'ho-demo', sourceCounterId: 'counter-demo',
  destinationBranchId: 'branch-demo', transactionDate: '2026-08-11', sellTransactionNumber: 'CARD-SELL-00001',
  purchaseTransactionNumber: '', remarks: 'Initial branch stock movement', items: [{ currencyId: 'USD', per: '1', productId: 'CC', issuerPartyProfileId: 'issuer-demo', feAmount: '150.00', cards: demoCards.slice(0, 2) }],
  status: 'HELD', createdAt: '2026-08-11T10:30:00Z', sourceBranchName: 'HO Branch', destinationBranchName: 'Mumbai Branch', sourceCounterName: 'HO Counter 1',
}];

let requests = loadRequests();
const listeners = new Set<() => void>();
function loadRequests(): CardTransferRequest[] {
  try { const stored = window.localStorage.getItem(STORAGE_KEY); return stored ? JSON.parse(stored) as CardTransferRequest[] : initialRequests; } catch { return initialRequests; }
}
function publish() { try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(requests)); } catch { /* optional preview storage */ } listeners.forEach(listener => listener()); }
const subscribe = (listener: () => void) => { listeners.add(listener); return () => listeners.delete(listener); };
const getSnapshot = () => requests;

export const useCardTransfers = () => useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
export const getCardTransfer = (id: string) => requests.find(request => request.id === id);
export const createCardTransfer = (values: CardTransferFormValues) => {
  const number = `CARD-${values.transferType === 'SELL' ? 'SELL' : 'PURCHASE'}-${String(requests.length + 1).padStart(5, '0')}`;
  const request: CardTransferRequest = { ...values, sellTransactionNumber: values.transferType === 'SELL' ? number : values.sellTransactionNumber, purchaseTransactionNumber: values.transferType === 'PURCHASE' ? number : values.purchaseTransactionNumber, id: `card-transfer-${Date.now()}`, status: 'HELD', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  requests = [request, ...requests]; publish(); return request;
};
export const updateCardTransfer = (id: string, values: CardTransferFormValues) => { requests = requests.map(request => request.id === id ? { ...request, ...values, updatedAt: new Date().toISOString() } : request); publish(); };
export const updateCardTransferStatus = (id: string, status: CardTransferStatus, rejectionReason?: string) => { requests = requests.map(request => request.id === id ? { ...request, status, rejectionReason, updatedAt: new Date().toISOString(), purchaseTransactionNumber: status === 'ACCEPTED' && !request.purchaseTransactionNumber ? `CARD-PURCHASE-${String(requests.length).padStart(5, '0')}` : request.purchaseTransactionNumber } : request); publish(); };
export const deleteCardTransfer = (id: string) => { requests = requests.filter(request => request.id !== id); publish(); };
