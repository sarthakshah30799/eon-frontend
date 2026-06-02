import type {
  ICompanyProfile,
  ICreateCompanyProfile,
} from '../types';

export const createEmptyCompanyProfileFormValues =
  (): ICreateCompanyProfile => ({
    shortCode: '',
    name: '',
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
    email: '',
  });

export const mapCompanyProfileToFormValues = (
  profile: ICompanyProfile
): ICreateCompanyProfile => ({
  shortCode: profile.shortCode ?? '',
  name: profile.name,
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
  email: profile.email ?? '',
});
