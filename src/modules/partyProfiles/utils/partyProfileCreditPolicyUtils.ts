import type {
  ICreatePartyProfile,
  IUpgradePartyProfileCreditPolicy,
} from '../types';

export const PARTY_PROFILE_CREDIT_POLICY_FIELDS = [
  'permanentCreditLimit',
  'permanentCreditDays',
  'temporaryCreditLimit',
  'temporaryCreditDays',
  'chqTrxnLimit',
] as const;

export type PartyProfileCreditPolicyField =
  (typeof PARTY_PROFILE_CREDIT_POLICY_FIELDS)[number];

type PartyProfileDirtyFields = Partial<
  Record<keyof ICreatePartyProfile, boolean | object>
>;

const normalizeCreditPolicyValue = (value: unknown) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const hasDirtyCreditPolicyFields = (dirtyFields: PartyProfileDirtyFields) =>
  PARTY_PROFILE_CREDIT_POLICY_FIELDS.some(field => Boolean(dirtyFields[field]));

export const hasChangedCreditPolicyFields = (
  values: Partial<ICreatePartyProfile>,
  baselineValues: Partial<ICreatePartyProfile>
) =>
  PARTY_PROFILE_CREDIT_POLICY_FIELDS.some(field => {
    const current = normalizeCreditPolicyValue(values[field]);
    const baseline = normalizeCreditPolicyValue(baselineValues[field]);
    return current !== baseline;
  });

export const pickChangedPartyProfileCreditPolicyValues = (
  values: Partial<ICreatePartyProfile>,
  baselineValues: Partial<ICreatePartyProfile>
): IUpgradePartyProfileCreditPolicy => {
  const payload: IUpgradePartyProfileCreditPolicy = {};

  PARTY_PROFILE_CREDIT_POLICY_FIELDS.forEach(field => {
    const current = normalizeCreditPolicyValue(values[field]);
    const baseline = normalizeCreditPolicyValue(baselineValues[field]);

    if (current === baseline || current === null) {
      return;
    }

    payload[field] = current;
  });

  return payload;
};

export const pickDirtyPartyProfileCreditPolicyValues = (
  values: Partial<ICreatePartyProfile>,
  dirtyFields: PartyProfileDirtyFields,
  baselineValues?: Partial<ICreatePartyProfile>
): IUpgradePartyProfileCreditPolicy => {
  const dirtyPayload = PARTY_PROFILE_CREDIT_POLICY_FIELDS.reduce(
    (payload, field) => {
      if (!dirtyFields[field]) {
        return payload;
      }

      const value = normalizeCreditPolicyValue(values[field]);
      if (value !== null) {
        payload[field] = value;
      }

      return payload;
    },
    {} as IUpgradePartyProfileCreditPolicy
  );

  if (Object.keys(dirtyPayload).length > 0 || !baselineValues) {
    return dirtyPayload;
  }

  return pickChangedPartyProfileCreditPolicyValues(values, baselineValues);
};

export const omitPartyProfileCreditPolicyValues = <T extends Partial<ICreatePartyProfile>>(
  values: T
): Omit<T, PartyProfileCreditPolicyField> => {
  const next = { ...values };

  PARTY_PROFILE_CREDIT_POLICY_FIELDS.forEach(field => {
    delete next[field];
  });

  return next;
};

export const hasDirtyNonCreditPolicyFields = (
  dirtyFields: PartyProfileDirtyFields
) =>
  Object.entries(dirtyFields).some(
    ([field, isDirty]) =>
      Boolean(isDirty) &&
      !PARTY_PROFILE_CREDIT_POLICY_FIELDS.includes(
        field as PartyProfileCreditPolicyField
      )
  );
