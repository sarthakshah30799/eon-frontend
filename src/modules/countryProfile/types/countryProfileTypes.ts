import type { ICountryGroup } from '@/api/countryGroup/countryGroup.api';
import type { IOffsetPaginationParams, IPaginatedResponse } from '@/types/pagination';

export const CountryRiskCategory = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

export type CountryRiskCategory =
  (typeof CountryRiskCategory)[keyof typeof CountryRiskCategory];

export interface ICountryProfile {
  id: string;
  code: string;
  name: string;
  lrsCountryCode: string;
  ctrCountryCode: string;
  riskCategory: CountryRiskCategory;
  restrictedCountry: boolean;
  greyListCountry: boolean;
  baseCountry: boolean;
  isCisCountry?: boolean;
  isBlocked?: boolean;
  blockedAt?: string | null;
  blockedById?: string | null;
  blockedReason?: string | null;
  countryGroupId?: string;
  countryGroup?: ICountryGroup;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export type ICreateCountryProfile = Omit<
  ICountryProfile,
  'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'
>;

export type IUpdateCountryProfile = Partial<ICreateCountryProfile>;

export interface ICountryProfileListQuery extends IOffsetPaginationParams {
  search?: string;
  code?: string;
  name?: string;
  riskCategory?: string;
  restrictedCountry?: boolean;
  greyListCountry?: boolean;
  baseCountry?: boolean;
  hideBlockedCountry?: boolean;
  hideRestrictedCountry?: boolean;
  hideBaseCountry?: boolean;
}

export interface IBackendCountry {
  id: string;
  code: string;
  name: string;
  lrsCountryCode?: string | null;
  ctrCountryCode?: string | null;
  riskCategory: CountryRiskCategory;
  restrictedCountry: boolean;
  greyListCountry: boolean;
  baseCountry: boolean;
  isCisCountry?: boolean;
  isBlocked?: boolean;
  blockedAt?: string | null;
  blockedById?: string | null;
  blockedReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type IBackendCountryListResponse = IPaginatedResponse<IBackendCountry>;

export type ICountryProfileListResponse = IPaginatedResponse<ICountryProfile>;
