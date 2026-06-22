import type { AsyncSelectOption } from '@/components/ui';

export const PARTY_PROFILE_TYPE_VALUES = [
  'party-profiles',
  'client-agent',
  'authorized-delear',
] as const;

export type PartyProfileType =
  (typeof PARTY_PROFILE_TYPE_VALUES)[number];

export interface PartyProfileTypeConfig {
  value: PartyProfileType;
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

const partyProfileTypeConfigMap: Record<
  PartyProfileType,
  PartyProfileTypeConfig
> = {
  'party-profiles': {
    value: 'party-profiles',
    label: 'Party Profile',
    createButtonLabel: 'Create Party Profile',
    listEmptyMessage: 'No Party Profiles found. Create your first profile.',
    toastLabel: 'Party Profile',
    endpoint: '/party-profiles',
    groupOptions: [buildGroupOption('Party Profile')],
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

export const PARTY_PROFILE_TYPE_OPTIONS = (
  Object.values(partyProfileTypeConfigMap) as PartyProfileTypeConfig[]
).map(({ value, label }) => ({
  value,
  label,
}));

export const DEFAULT_PARTY_PROFILE_TYPE: PartyProfileType =
  'party-profiles';

export const getPartyProfileTypeConfig = (
  type?: string | null
): PartyProfileTypeConfig => {
  if (
    type &&
    PARTY_PROFILE_TYPE_VALUES.includes(
      type as PartyProfileType
    )
  ) {
    return partyProfileTypeConfigMap[
      type as PartyProfileType
    ];
  }

  return partyProfileTypeConfigMap[
    DEFAULT_PARTY_PROFILE_TYPE
  ];
};

export const normalizePartyProfileType = (
  type?: string | null
): PartyProfileType =>
  getPartyProfileTypeConfig(type).value;
