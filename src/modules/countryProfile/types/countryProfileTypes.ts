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

export interface ICountryProfileListQuery {
  page?: number;
  limit?: number;
  search?: string;
  code?: string;
  name?: string;
  riskCategory?: string;
  restrictedCountry?: boolean;
  greyListCountry?: boolean;
  baseCountry?: boolean;
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
  createdAt: string;
  updatedAt: string;
}

export interface IBackendCountryListResponse {
  data: IBackendCountry[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface ICountryProfileListResponse {
  data: ICountryProfile[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}
