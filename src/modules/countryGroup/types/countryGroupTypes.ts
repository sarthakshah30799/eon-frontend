import type {
  ICountryGroup,
  ICountryGroupCurrencyProfile,
  ICountryGroupFormValues,
  ICreateCountryGroup,
  IUpdateCountryGroup,
} from '@/api/countryGroup';

export type {
  ICountryGroup,
  ICountryGroupCurrencyProfile,
  ICountryGroupFormValues,
  ICreateCountryGroup,
  IUpdateCountryGroup,
};

export interface ICountryGroupListResponse {
  data: ICountryGroup[];
}
