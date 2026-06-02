export interface CountryProfileFormValues {
  countryCode: string;
  countryName: string;
  lrsCountryCode: string;
  ctrCountryCode: string;
  riskCategory: string;
  restrictedCountry: boolean;
  greyListCountry: boolean;
  baseCountry: boolean;
}

export interface CountryProfileRecord extends CountryProfileFormValues {
  id: string;
  createdAt: string;
  updatedAt: string;
}
