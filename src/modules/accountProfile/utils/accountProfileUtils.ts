import type { ICreateAccountProfile } from '../types/accountProfileTypes';

export const ACCOUNT_PROFILE_BASE_CURRENCY_CODE = 'INR';

/** Account Profile currency dropdown: active currencies only (tradable via API default). */
export const isAccountProfileCurrencyOption = (currency: {
  active?: boolean;
  currencyCode?: string;
}) => currency.active !== false;

export const createEmptyAccountProfileFormValues =
  (): ICreateAccountProfile => ({
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
    retailSale: false,
    retailPurchase: false,
    bulkSale: false,
    bulkPurchase: false,
    expense: false,
    receipt: false,
    payment: false,
    journalVoucher: false,
    active: true,
    cmsBank: false,
    directRemittance: false,
  });
