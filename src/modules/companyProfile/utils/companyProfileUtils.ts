import type {
  CompanyProfile,
  CompanyProfileFormValues,
} from '../types';

export const createEmptyCompanyProfileFormValues =
  (): CompanyProfileFormValues => ({
    shortCode: '',
    companyName: '',
    formerlyKnownName: '',
    cinNo: '',
    panNo: '',
    fxRegNo: '',
    fxRegDate: '',
    fromDate: '',
    toDate: '',
    logo: '',
    aeonLicNo: '',
    website: '',
    emailId: '',
  });

export const mapCompanyProfileToFormValues = (
  profile: CompanyProfile
): CompanyProfileFormValues => ({
  shortCode: profile.shortCode ?? '',
  companyName: profile.companyName,
  formerlyKnownName: profile.formerlyKnownName ?? '',
  cinNo: profile.cinNo ?? '',
  panNo: profile.panNo ?? '',
  fxRegNo: profile.fxRegNo ?? '',
  fxRegDate: profile.fxRegDate ? profile.fxRegDate.slice(0, 10) : '',
  fromDate: profile.fromDate ? profile.fromDate.slice(0, 10) : '',
  toDate: profile.toDate ? profile.toDate.slice(0, 10) : '',
  logo: profile.logo ?? '',
  aeonLicNo: profile.aeonLicNo ?? '',
  website: profile.website ?? '',
  emailId: profile.emailId ?? '',
});
