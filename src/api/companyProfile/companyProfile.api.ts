import type {
  CompanyProfile,
  CompanyProfileFormValues,
} from '../../modules/companyProfile/types';

let companyProfiles: Record<string, CompanyProfile> = {
  '1': {
    id: '1',
    companyName: 'Maraekat FX Pvt. Ltd.',
    rbiName: 'RBI Main Office',
    rbiDesignation: 'Regional Compliance Officer',
    rbiPlace: 'Mumbai',
    rbiAddress1: '12 Business Tower',
    rbiAddress2: 'Nariman Point',
    rbiAddress3: 'Mumbai, Maharashtra',
  },
  '2': {
    id: '2',
    companyName: 'Maraekat Global Exchange',
    rbiName: 'RBI Sub Office',
    rbiDesignation: 'Assistant Manager',
    rbiPlace: 'Delhi',
    rbiAddress1: '45 Exchange Plaza',
    rbiAddress2: 'Connaught Place',
    rbiAddress3: 'New Delhi',
  },
};

const createEmptyCompanyProfile = (id: string): CompanyProfile => ({
  id,
  companyName: '',
  rbiName: '',
  rbiDesignation: '',
  rbiPlace: '',
  rbiAddress1: '',
  rbiAddress2: '',
  rbiAddress3: '',
});

export const companyProfileApi = {
  getCompanyProfileById: async (id: string) => {
    await Promise.resolve();
    return {
      data: companyProfiles[id] ?? createEmptyCompanyProfile(id),
      error: null,
    };
  },
  updateCompanyProfile: async (
    id: string,
    values: CompanyProfileFormValues
  ) => {
    await Promise.resolve();

    const updatedProfile: CompanyProfile = {
      id,
      ...values,
    };

    companyProfiles = {
      ...companyProfiles,
      [id]: updatedProfile,
    };

    return {
      data: updatedProfile,
      error: null,
    };
  },
};
