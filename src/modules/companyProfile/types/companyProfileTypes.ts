export interface CompanyProfile {
  id: string;
  name: string;
  designation: string;
  rbiName: string;
  rbiPlace: string;
  address1: string;
  address2?: string;
  address3?: string;
  pincode: string;
  city: string;
  state: string;
  country?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CompanyProfileFormValues = Omit<CompanyProfile, 'id' | 'createdAt' | 'updatedAt'>;
