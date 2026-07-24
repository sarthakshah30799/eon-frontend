export const PurposeRateTypeEnum = {
  PERCENT: 'PERCENT',
  RUPEES: 'RUPEES',
} as const;

export type PurposeRateType = (typeof PurposeRateTypeEnum)[keyof typeof PurposeRateTypeEnum];

export interface IPurposeSlab {
  id: string;
  purposeId: string;
  sortOrder: number;
  fromAmount: number;
  toAmount: number | null;
  rate: number;
  rateType: PurposeRateType;
  createdAt: string;
  updatedAt: string;
}

export interface IPurpose {
  id: string;
  code: string;
  description: string;
  threshold: number;
  rate: number;
  rateType: PurposeRateType;
  transactionType: import('@/modules/transactions').TransactionType;
  slabs: IPurposeSlab[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export type ICreatePurposeSlab = Omit<IPurposeSlab, 'id' | 'purposeId' | 'createdAt' | 'updatedAt'>;

export type ICreatePurpose = Omit<
  IPurpose,
  'id' | 'slabs' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'
> & {
  slabs: Array<{
    id?: string;
    sortOrder: number;
    fromAmount: number;
    toAmount: number | null;
    rate: number;
    rateType: PurposeRateType;
  }>;
};

export type IUpdatePurpose = Partial<ICreatePurpose>;

export interface IPurposeListQuery {
  search?: string;
}

export interface IPurposeListResponse {
  data: IPurpose[];
}
