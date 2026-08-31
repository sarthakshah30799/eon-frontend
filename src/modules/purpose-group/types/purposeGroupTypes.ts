import type {
  IOffsetPaginationParams,
  IPaginatedResponse,
} from '@/types/pagination';
import type { IPurpose } from '@/modules/purpose/types';

export const PurposeGroupProfileTypeEnum = {
  FFMC: 'FFMC',
  AD: 'AD',
} as const;

export type PurposeGroupProfileType =
  (typeof PurposeGroupProfileTypeEnum)[keyof typeof PurposeGroupProfileTypeEnum];

export interface IPurposeGroup {
  id: string;
  name: string;
  title: string;
  profileType: PurposeGroupProfileType;
  sortOrder: number;
  purposes: IPurpose[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface ICreatePurposeGroup {
  name: string;
  title: string;
  profileType: PurposeGroupProfileType | '';
  sortOrder: number;
  purposeIds: string[];
}

export type IUpdatePurposeGroup = Partial<ICreatePurposeGroup>;

export interface IPurposeGroupListQuery extends IOffsetPaginationParams {
  search?: string;
  profileType?: PurposeGroupProfileType;
}

export type IPurposeGroupListResponse = IPaginatedResponse<IPurposeGroup>;
