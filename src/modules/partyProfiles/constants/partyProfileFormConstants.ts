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
    'Credit policy fields are locked on edit. Click Upgrade Limit to change limits and save.',
  saveBlockedUntilUpgrade:
    'Click Upgrade Limit to edit credit policy fields, or change another section to save.',
} as const;
