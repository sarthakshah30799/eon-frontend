export interface ICompanyProfile {
  id: string;
  shortCode?: string;
  companyName: string;
  formerlyKnownName?: string;
  cinNo?: string;
  panNo?: string;
  fxRegNo?: string;
  fxRegDate?: string;
  fromDate?: string;
  toDate?: string;
  logo?: string;
  aeonLicNo?: string;
  website?: string;
  emailId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICreateCompanyProfile {
  shortCode: string;
  companyName: string;
  formerlyKnownName: string;
  cinNo: string;
  panNo: string;
  fxRegNo: string;
  fxRegDate: string;
  fromDate: string;
  toDate: string;
  logo: string;
  aeonLicNo: string;
  website: string;
  emailId: string;
}

export type IUpdateCompanyProfile = Partial<ICreateCompanyProfile>;
