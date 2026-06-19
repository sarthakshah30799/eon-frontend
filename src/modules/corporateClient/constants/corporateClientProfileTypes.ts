import type { AsyncSelectOption } from '@/components/ui';

export const CORPORATE_CLIENT_PROFILE_TYPE_VALUES = [
  'corporate-client-profile',
  'client-agent',
  'authorized-delear',
] as const;

export type CorporateClientProfileType =
  (typeof CORPORATE_CLIENT_PROFILE_TYPE_VALUES)[number];

export interface CorporateClientProfileTypeConfig {
  value: CorporateClientProfileType;
  label: string;
  createButtonLabel: string;
  listEmptyMessage: string;
  toastLabel: string;
  endpoint: string;
  groupOptions: AsyncSelectOption[];
}

const buildGroupOption = (label: string): AsyncSelectOption => ({
  value: label,
  label,
});

const corporateClientProfileTypeConfigMap: Record<
  CorporateClientProfileType,
  CorporateClientProfileTypeConfig
> = {
  'corporate-client-profile': {
    value: 'corporate-client-profile',
    label: 'Corporate client',
    createButtonLabel: 'Create Corporate client profile',
    listEmptyMessage: 'No Corporate client profiles found. Create your first profile.',
    toastLabel: 'Corporate Client Profile',
    endpoint: '/corporate-clients',
    groupOptions: [buildGroupOption('Corporate client')],
  },
  'client-agent': {
    value: 'client-agent',
    label: 'Client Agent',
    createButtonLabel: 'Create Client Agent',
    listEmptyMessage: 'No Client Agent profiles found. Create your first profile.',
    toastLabel: 'Client Agent',
    endpoint: '/client-agent',
    groupOptions: [buildGroupOption('Client Agent')],
  },
  'authorized-delear': {
    value: 'authorized-delear',
    label: 'authorized delar',
    createButtonLabel: 'Create authorized delar',
    listEmptyMessage:
      'No authorized delar profiles found. Create your first profile.',
    toastLabel: 'authorized delar',
    endpoint: '/authorized-delear',
    groupOptions: [buildGroupOption('authorized delar')],
  },
};

export const CORPORATE_CLIENT_PROFILE_TYPE_OPTIONS = (
  Object.values(corporateClientProfileTypeConfigMap) as CorporateClientProfileTypeConfig[]
).map(({ value, label }) => ({
  value,
  label,
}));

export const DEFAULT_CORPORATE_CLIENT_PROFILE_TYPE: CorporateClientProfileType =
  'corporate-client-profile';

export const getCorporateClientProfileTypeConfig = (
  type?: string | null
): CorporateClientProfileTypeConfig => {
  if (
    type &&
    CORPORATE_CLIENT_PROFILE_TYPE_VALUES.includes(
      type as CorporateClientProfileType
    )
  ) {
    return corporateClientProfileTypeConfigMap[
      type as CorporateClientProfileType
    ];
  }

  return corporateClientProfileTypeConfigMap[
    DEFAULT_CORPORATE_CLIENT_PROFILE_TYPE
  ];
};

export const normalizeCorporateClientProfileType = (
  type?: string | null
): CorporateClientProfileType =>
  getCorporateClientProfileTypeConfig(type).value;
