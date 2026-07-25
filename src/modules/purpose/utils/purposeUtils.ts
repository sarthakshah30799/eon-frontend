import type { ICreatePurpose, IPurpose } from '../types/purposeTypes';
import { PurposeRateTypeEnum } from '../types/purposeTypes';

const formatDateForInput = (value?: string | Date | null): string => {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toISOString().split('T')[0];
};

export const createEmptyPurposeFormValues = (): ICreatePurpose => ({
  code: '',
  description: '',
  threshold: 0,
  rate: 0,
  rateType: PurposeRateTypeEnum.PERCENT,
  corporate: true,
  individual: false,
  sell: false,
  purchase: true,
  slabs: [],
});

export const mapPurposeToFormValues = (purpose: IPurpose): ICreatePurpose => ({
  code: purpose.code,
  description: purpose.description,
  threshold: purpose.threshold,
  rate: purpose.rate,
  rateType: purpose.rateType,
  corporate: purpose.corporate,
  individual: purpose.individual,
  sell: purpose.sell,
  purchase: purpose.purchase,
  slabs: (purpose.slabs ?? []).map(slab => ({
    id: slab.id,
    sortOrder: slab.sortOrder,
    fromAmount: slab.fromAmount,
    toAmount: slab.toAmount,
    rate: slab.rate,
    rateType: slab.rateType,
  })),
});

export const sanitizePurposeFormValues = (values: ICreatePurpose): ICreatePurpose => ({
  ...values,
  code: values.code.trim().toUpperCase(),
  description: values.description.trim(),
  threshold: Number(values.threshold || 0),
  rate: Number(values.rate || 0),
  corporate: Boolean(values.corporate),
  individual: Boolean(values.individual),
  sell: Boolean(values.sell),
  purchase: Boolean(values.purchase),
  slabs: (values.slabs ?? []).map(slab => ({
    ...slab,
    sortOrder: Number(slab.sortOrder || 0),
    fromAmount: Number(slab.fromAmount || 0),
    toAmount:
      slab.toAmount === null || slab.toAmount === undefined
        ? null
        : Number(slab.toAmount),
    rate: Number(slab.rate || 0),
    rateType: slab.rateType,
  })),
});

export const formatPurposeRateLabel = (rate: number, rateType: string) =>
  `${Number(rate).toFixed(2)} ${rateType === PurposeRateTypeEnum.RUPEES ? 'Rupees' : '%'}`;

export const formatPurposeScopeLabel = (corporate: boolean, individual: boolean) => {
  const values: string[] = [];
  if (corporate) values.push('Corporate');
  if (individual) values.push('Individual');
  return values.length > 0 ? values.join(' / ') : '-';
};

export const formatPurposeTransactionScopeLabel = (sell: boolean, purchase: boolean) => {
  const values: string[] = [];
  if (sell) values.push('Sell');
  if (purchase) values.push('Purchase');
  return values.length > 0 ? values.join(' / ') : '-';
};

export const formatPurposeDateForInput = formatDateForInput;
