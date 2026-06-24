import type { ICreateAccountProfile } from '../types/accountProfileTypes';

export const createEmptyAccountProfileFormValues = (): ICreateAccountProfile => ({
  divisionDept: '',
  accountCode: '',
  accountName: '',
  accountType: '',
  subLedger: '',
  bankNature: '',
  currencyId: '',
  financialCodeId: '',
  financialSubProfileId: '',
  pettyCashExpenseId: '',
  zeroBalanceAtEod: false,
  branchIdToTransfer: '',
  mapToAccountId: '',
  doSale: false,
  doPurchase: false,
  doReceipt: false,
  doPayment: false,
  active: true,
  cmsBank: false,
  directRemittance: false,
});
