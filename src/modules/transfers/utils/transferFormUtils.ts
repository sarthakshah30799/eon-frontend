import type { ICreateTransferPayload } from '@/api/transfers/transfers.api';
import {
  calculateRoundedTransactionAmount,
  calculateTransactionRoundOff,
  calculateTransactionTotal,
  formatPurchaseDecimal,
} from '@/modules/purchase/utils/purchaseUtils';
import {
  TransferTypeEnum,
  type ICurrencyTransfer,
  type ITransferFormItem,
  type ITransferFormValues,
} from '../types';
import type { ITransactionReferenceSnapshot } from '@/modules/transactions';

export const createEmptyTransferFormItem = (): ITransferFormItem => ({
  currencyId: '',
  currencyCode: '',
  currencyName: '',
  productId: '',
  productCode: '',
  productDescription: '',
  quantity: '',
  per: '1',
  rate: '',
  rateEditable: false,
  total: '',
  roundOff: '',
  finalAmount: '',
  commission: '0',
  commissionSnapshot: null,
});

export const createEmptyTransferFormValues = (params: {
  transferType: ITransferFormValues['transferType'];
  transactionDate: string;
  sourceBranchId?: string;
  sourceCounterId?: string;
  destinationBranchId?: string;
  destinationCounterId?: string;
}): ITransferFormValues => ({
  transferType: params.transferType,
  number: '',
  transactionDate: params.transactionDate,
  billReference: '',
  sourceBranchId: params.sourceBranchId ?? '',
  sourceCounterId: params.sourceCounterId ?? '',
  destinationBranchId: params.destinationBranchId ?? '',
  destinationCounterId: params.destinationCounterId ?? '',
  items: [createEmptyTransferFormItem()],
});

const snapshotValue = (
  snapshot: ITransactionReferenceSnapshot | null | undefined,
  ...keys: string[]
) => {
  for (const key of keys) {
    const value = snapshot?.[key];
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }
  return '';
};

const dateOnly = (value: string | null) => value?.slice(0, 10) ?? '';

export const mapTransferToFormValues = (
  transfer: ICurrencyTransfer
): ITransferFormValues => ({
  transferType: transfer.transferType,
  number: transfer.number ?? '',
  transactionDate: dateOnly(transfer.transactionDate),
  billReference: transfer.billReference ?? '',
  sourceBranchId: transfer.sourceBranchId,
  sourceCounterId: transfer.sourceCounterId,
  destinationBranchId: transfer.destinationBranchId,
  destinationCounterId: transfer.destinationCounterId,
  rejectionReason: '',
  items: transfer.items.map(item => ({
    currencyId: item.currencyId,
    currencyCode: snapshotValue(item.currencySnapshot, 'label', 'code'),
    currencyName: snapshotValue(item.currencySnapshot, 'currencyName', 'name'),
    productId: item.productId,
    productCode: snapshotValue(item.productSnapshot, 'label', 'code'),
    productDescription: snapshotValue(
      item.productSnapshot,
      'productDescription',
      'description',
      'name'
    ),
    quantity: String(item.quantity ?? ''),
    per: String(item.per ?? ''),
    rate: String(item.rate ?? ''),
    rateEditable: Boolean(item.rateEditable),
    total: String(item.amount ?? ''),
    roundOff: String(item.roundOff ?? ''),
    finalAmount: String(item.finalAmount ?? ''),
    commission: '0',
    commissionSnapshot: null,
  })),
});

export const calculateTransferRowAmounts = (params: {
  quantity: string;
  rate: string;
  per: string;
}) => {
  const total = calculateTransactionTotal(
    params.quantity,
    params.rate,
    params.per
  );
  const roundedTotal = calculateRoundedTransactionAmount(total);
  const roundOff = calculateTransactionRoundOff(total);

  return {
    total,
    roundOff,
    finalAmount: roundedTotal,
  };
};

export const mapTransferFormValuesToPayload = (
  values: ITransferFormValues
): Omit<ICreateTransferPayload, 'transferType'> => {
  return {
    transactionDate: values.transactionDate || null,
    billReference: values.billReference,
    sourceBranchId: values.sourceBranchId || null,
    sourceCounterId: values.sourceCounterId || null,
    destinationBranchId: values.destinationBranchId || null,
    destinationCounterId: values.destinationCounterId || null,
    items: values.items
      .filter(item => Boolean(item.currencyId && item.productId))
      .map(item => ({
        currencyId: item.currencyId,
        productId: item.productId,
        quantity: item.quantity,
        per: item.per,
        rate: item.rate,
        rateEditable: Boolean(item.rateEditable),
        amount: item.total ?? undefined,
        roundOff: item.roundOff ?? undefined,
        finalAmount: item.finalAmount ?? undefined,
      })),
  };
};

export const formatTransferAmount = (
  value?: string | number | null,
  decimals = 2
) => formatPurchaseDecimal(value, decimals);

export const isBranchTransferType = (transferType: string) =>
  transferType === TransferTypeEnum.BRANCH;
