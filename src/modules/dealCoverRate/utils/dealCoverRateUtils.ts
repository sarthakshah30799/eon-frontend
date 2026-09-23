import type {
  DealCoverRatePayload,
  IDealCoverRate,
} from '@/api/dealCoverRate';
import { TT_PRODUCT_CODE } from '../constants';
import type { DealCoverRateFormValues } from '../types';

export const isTtProductCode = (productCode?: string | null): boolean =>
  String(productCode ?? '')
    .trim()
    .toUpperCase() === TT_PRODUCT_CODE;

export const emptyDealCoverForm = (
  branchId = ''
): DealCoverRateFormValues => ({
  branchId,
  transactionDate: '',
  bankAccountProfileId: '',
  productId: '',
  partyProfileType: 'CORPORATE_CLIENT',
  partyProfileId: '',
  marketingExecutiveId: '',
  passengerId: '',
  passengerName: '',
  passengerPan: '',
  passengerPanHolder: '',
  passengerPanDob: '',
  passengerPassport: '',
  purposeId: '',
  subpurposeId: '',
  currencyId: '',
  issuerPartyProfileId: '',
  feAmount: '',
  dealRate: '',
  inrAmount: '',
  fbChargeAmount: '0',
  narration: '',
  maturityOptionId: '',
});

export const calculateInrAmount = (feAmount: string, dealRate: string) => {
  const amount = Number(feAmount) * Number(dealRate);
  return Number.isFinite(amount) ? amount.toFixed(2) : '';
};

export const mapDealToForm = (
  deal: IDealCoverRate
): DealCoverRateFormValues => ({
  branchId: deal.branchId,
  transactionDate: String(deal.transactionDate).slice(0, 10),
  bankAccountProfileId: deal.bankAccountProfileId,
  productId: deal.productId,
  partyProfileType: deal.partyProfileType,
  partyProfileId: deal.partyProfileId,
  marketingExecutiveId: deal.marketingExecutiveId ?? '',
  passengerId: deal.passengerId ?? '',
  passengerName: deal.passengerName ?? '',
  passengerPan: deal.passengerPan ?? '',
  passengerPanHolder: deal.passengerPanHolder ?? '',
  passengerPanDob: deal.passengerPanDob
    ? String(deal.passengerPanDob).slice(0, 10)
    : '',
  passengerPassport: deal.passengerPassport ?? '',
  purposeId: deal.purposeId,
  subpurposeId: deal.subpurposeId ?? '',
  currencyId: deal.currencyId,
  issuerPartyProfileId: deal.issuerPartyProfileId,
  feAmount: deal.feAmount,
  dealRate: deal.dealRate,
  inrAmount: deal.inrAmount,
  fbChargeAmount: deal.fbChargeAmount ?? '0',
  narration: deal.narration ?? '',
  maturityOptionId: deal.maturityOptionId,
  status: deal.status,
  dealNo: deal.dealNo ?? undefined,
  bookingRate: deal.bookingRate ?? undefined,
  rejectionReason: deal.rejectionReason ?? undefined,
  branchSnapshot: deal.branchSnapshot,
  bankAccountProfileSnapshot: deal.bankAccountProfileSnapshot,
  productSnapshot: deal.productSnapshot,
  partyProfileSnapshot: deal.partyProfileSnapshot,
  currencySnapshot: deal.currencySnapshot,
  issuerPartyProfileSnapshot: deal.issuerPartyProfileSnapshot,
});

export const toDealCoverPayload = (
  values: DealCoverRateFormValues
): DealCoverRatePayload => ({
  branchId: values.branchId,
  transactionDate: values.transactionDate,
  bankAccountProfileId: values.bankAccountProfileId,
  productId: values.productId,
  partyProfileType: values.partyProfileType,
  partyProfileId: values.partyProfileId,
  marketingExecutiveId: values.marketingExecutiveId || null,
  passengerId: values.passengerId || null,
  passengerName: values.passengerName || null,
  passengerPan: values.passengerPan || null,
  passengerPanHolder: values.passengerPanHolder || null,
  passengerPanDob: values.passengerPanDob || null,
  passengerPassport: values.passengerPassport || null,
  purposeId: values.purposeId,
  subpurposeId: values.subpurposeId || null,
  currencyId: values.currencyId,
  issuerPartyProfileId: values.issuerPartyProfileId,
  feAmount: values.feAmount,
  dealRate: values.dealRate,
  inrAmount: values.inrAmount,
  fbChargeAmount: values.fbChargeAmount || '0',
  narration: values.narration || null,
  maturityOptionId: values.maturityOptionId,
});

export const snapshotLabel = (
  snapshot:
    | {
        label?: string;
        name?: string;
        code?: string;
        currencyCode?: string;
        currencyName?: string;
        productCode?: string;
        productDescription?: string;
        accountCode?: string;
        accountName?: string;
      }
    | null
    | undefined,
  fallback = ''
) => {
  if (snapshot?.label) return snapshot.label;
  const composed = [
    snapshot?.code ??
      snapshot?.currencyCode ??
      snapshot?.productCode ??
      snapshot?.accountCode,
    snapshot?.name ??
      snapshot?.currencyName ??
      snapshot?.productDescription ??
      snapshot?.accountName,
  ]
    .filter(Boolean)
    .join(' - ');
  return composed || fallback;
};

export const groupDealsByCurrency = (deals: IDealCoverRate[]) => {
  const groups = new Map<
    string,
    {
      currencyId: string;
      currencySnapshot: IDealCoverRate['currencySnapshot'];
      items: IDealCoverRate[];
      totalFe: number;
      weightedRateSum: number;
      totalInr: number;
    }
  >();

  for (const deal of deals) {
    const existing = groups.get(deal.currencyId);
    const fe = Number(deal.feAmount) || 0;
    const rate = Number(deal.dealRate) || 0;
    const inr = Number(deal.inrAmount) || 0;
    if (existing) {
      existing.items.push(deal);
      existing.totalFe += fe;
      existing.weightedRateSum += rate * fe;
      existing.totalInr += inr;
      continue;
    }
    groups.set(deal.currencyId, {
      currencyId: deal.currencyId,
      currencySnapshot: deal.currencySnapshot,
      items: [deal],
      totalFe: fe,
      weightedRateSum: rate * fe,
      totalInr: inr,
    });
  }

  return Array.from(groups.values()).map(group => ({
    currencyId: group.currencyId,
    currencySnapshot: group.currencySnapshot,
    items: group.items,
    totalFeAmount: group.totalFe.toFixed(2),
    weightedAvgDealRate:
      group.totalFe > 0
        ? (group.weightedRateSum / group.totalFe).toFixed(4)
        : '0.0000',
    totalInrAmount: group.totalInr.toFixed(2),
  }));
};
