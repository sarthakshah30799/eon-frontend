import type {
  CompanyProfile,
  CompanyProfileFormValues,
} from '../types';

export const createEmptyCompanyProfileFormValues =
  (): CompanyProfileFormValues => ({
    logo: '',
    name: '',
    designation: '',
    rbiName: '',
    rbiPlace: '',
    address1: '',
    address2: '',
    address3: '',
    pincode: '',
    city: '',
    state: '',
    country: 'India',
  });

export const mapCompanyProfileToFormValues = (
  profile: CompanyProfile
): CompanyProfileFormValues => ({
  logo: profile.logo ?? '',
  name: profile.name,
  designation: profile.designation ?? '',
  rbiName: profile.rbiName ?? '',
  rbiPlace: profile.rbiPlace ?? '',
  address1: profile.address1,
  address2: profile.address2 ?? '',
  address3: profile.address3 ?? '',
  pincode: profile.pincode,
  city: profile.city,
  state: profile.state,
  country: profile.country ?? 'India',
});
