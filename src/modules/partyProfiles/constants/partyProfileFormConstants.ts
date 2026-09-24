export const PARTY_PROFILE_STATUS_TEXT = {
  accessDeniedType: 'You do not have access to this party profile type.',
  accessDeniedCreate:
    'You do not have access to create this party profile type.',
  accessDeniedEdit: 'You do not have access to edit this party profile type.',
  typeNotFound: 'This party profile type was not found.',
  detailsNotFound: 'Party profile details were not found.',
} as const;

export const CARD_ISSUER_FORM_TEXT = {
  sectionHeading: 'CARD Number Rules',
  lengthLabel: 'Card Number Length',
  lengthPlaceholder: 'Default 16',
  maskingLabel: 'Allow masked card numbers',
} as const;

export const PARTY_PROFILE_CREDIT_POLICY_TEXT = {
  sectionHeading: 'Credit Policy',
  upgradeLimit: 'Upgrade Limit',
  upgradeLimitHint:
    'Party profile fields are locked after create. Click Upgrade Limit to change only credit policy limits and save.',
  saveBlockedUntilUpgrade:
    'Click Upgrade Limit or Update Branches to unlock fields, then save.',
} as const;

export const PARTY_PROFILE_BRANCH_UPDATE_TEXT = {
  sectionHeading: 'GST Details',
  updateBranches: 'Update Branches',
  updateBranchesHint:
    'Branches are locked after create. Click Update Branches to change assigned branches and save.',
} as const;

export const PARTY_PROFILE_TAX_SETTINGS_TEXT = {
  gstExempt: 'GST Exempt',
} as const;

export const EMPLOYEE_PROFILE_FORM_TEXT = {
  detailsHeading: 'Employee Details',
  allowanceHeading: 'Allowance',
  deductionHeading: 'Deduction',
  dateOfJoining: 'Date of Joining',
  dateOfExit: 'Date of Exit',
  basicSalary: 'Basic Salary',
  netSalary: 'Net Salary',
  dareness: 'Dareness',
  houseRent: 'House Rent',
  conveyance: 'Conveyance',
  special: 'Special',
  other: 'Other',
  allowanceTotal: 'Allowance Total',
  pf: 'P.F.',
  ppf: 'P.P.F.',
  pTax: 'P. Tax',
  esic: 'E.S.I.C',
  incomeTax: 'Income Tax',
  deductionTotal: 'Deduction Total',
} as const;
