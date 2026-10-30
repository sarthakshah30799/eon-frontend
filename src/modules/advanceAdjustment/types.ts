import type { IPaginatedResponse } from '@/types/pagination';

export const AdvanceAdjustmentStatus = {
  DRAFT: 'DRAFT',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;
export type AdvanceAdjustmentStatus =
  (typeof AdvanceAdjustmentStatus)[keyof typeof AdvanceAdjustmentStatus];

export interface AdvanceAdjustmentSnapshot {
  id?: string;
  code?: string;
  key?: string;
  name?: string;
  label?: string;
  counterName?: string;
  number?: string;
  transactionDate?: string;
  transactionType?: string;
  slug?: string;
  finalAmount?: string | number;
  partyProfileId?: string;
  [key: string]: string | number | boolean | null | undefined;
}

export interface OutstandingSaleForAdjustment {
  id: string;
  number: string;
  transactionDate: string;
  transactionType: string;
  slug: string;
  partyProfileId: string;
  partyProfileSnapshot?: AdvanceAdjustmentSnapshot | null;
  finalAmount: string;
  byCash: string | null;
  byCheque: string | null;
  byCard: string | null;
  byTransfer: string | null;
  byOther: string | null;
  outstanding: string;
  branchId: string;
}

export interface OutstandingSalesParams {
  branchId: string;
  counterId: string;
  partyProfileId: string;
  asOnDate: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface AdvanceAdjustmentItem {
  id: string;
  advanceAdjustmentId: string;
  lineNo: number;
  transactionId: string;
  transactionSnapshot: AdvanceAdjustmentSnapshot;
  finalAmount: string;
  outstandingAmount: string;
  adjustmentAmount: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdvanceAdjustment {
  id: string;
  number: string;
  branchId: string;
  branchSnapshot: AdvanceAdjustmentSnapshot;
  counterId: string;
  counterSnapshot: AdvanceAdjustmentSnapshot;
  transactionDate: string;
  asOnDate: string;
  partyProfileId: string;
  partyProfileSnapshot: AdvanceAdjustmentSnapshot;
  panNumber: string | null;
  panName: string | null;
  panDob: string | null;
  status: AdvanceAdjustmentStatus;
  totalAdjustmentAmount: string;
  narration: string;
  items: AdvanceAdjustmentItem[];
  createdAt: string;
  updatedAt: string;
}

export interface AdvanceAdjustmentItemFormValue {
  transactionId: string;
  saleNumber: string;
  saleDate: string;
  slug: string;
  finalAmount: string;
  outstandingAmount: string;
  adjustmentAmount: string;
  selected: boolean;
}

export interface AdvanceAdjustmentFormValues {
  branchId: string;
  counterId: string;
  transactionDate: string;
  asOnDate: string;
  partyTypeOptionId?: string;
  partyProfileId: string;
  panNumber: string;
  panName: string;
  panDob: string;
  narration: string;
  items: AdvanceAdjustmentItemFormValue[];
}

export interface CreateAdvanceAdjustmentPayload {
  branchId: string;
  counterId: string;
  transactionDate: string;
  asOnDate: string;
  partyProfileId: string;
  panNumber?: string;
  panName?: string;
  panDob?: string;
  narration: string;
  items: Array<{
    transactionId: string;
    adjustmentAmount: string;
  }>;
}

export interface AdvanceAdjustmentListQuery {
  limit?: number;
  offset?: number;
  branchId?: string;
  partyProfileId?: string;
  status?: AdvanceAdjustmentStatus;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export type AdvanceAdjustmentListResponse = IPaginatedResponse<AdvanceAdjustment>;
