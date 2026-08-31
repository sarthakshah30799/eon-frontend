import type { ICreateAccountProfile } from '../types/accountProfileTypes';

export const ACCOUNT_PROFILE_BASE_CURRENCY_CODE = 'INR';

export const isAccountProfileCurrencyOption = (currency: {
  active?: boolean;
  currencyCode?: string;
}) => {
  const isBaseCurrency =
    String(currency.currencyCode ?? '')
      .trim()
      .toUpperCase() === ACCOUNT_PROFILE_BASE_CURRENCY_CODE;

  return currency.active !== false || isBaseCurrency;
};

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
