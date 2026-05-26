export interface CompanyProfile {
  id: string;
  companyName: string;
  rbiName: string;
  rbiDesignation: string;
  rbiPlace: string;
  rbiAddress1: string;
  rbiAddress2: string;
  rbiAddress3: string;
}

export type CompanyProfileFormValues = Omit<CompanyProfile, 'id'>;
