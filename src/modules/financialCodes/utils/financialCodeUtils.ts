import type { ICreateFinancialCode } from '../types/financialCodeTypes';

export const createEmptyFinancialCodeValues = (): ICreateFinancialCode => ({
  financialType: '',
  financialCode: '',
  financialName: '',
  defaultSign: '',
  priority: 0,
  subProfiles: [],
});
