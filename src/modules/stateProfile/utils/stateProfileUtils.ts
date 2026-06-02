import type { ICreateStateProfile } from '../types';

export const createEmptyStateProfileFormValues =
  (): ICreateStateProfile => ({
    countryId: '',
    code: '',
    name: '',
    gstStateCode: '',
    ctrStateCode: '',
  });
