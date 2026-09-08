import {
  hasAnyPassengerPassportValue,
  type PassengerIdentityValues,
} from './passengerIdentityRules';

export type PassengerDisplayNameInput = PassengerIdentityValues & {
  paidByPanHolderName?: string | null;
  partyProfileName?: string | null;
};

const trimPassengerText = (value?: string | null) => String(value ?? '').trim();

export const resolvePassengerDisplayName = (
  input: PassengerDisplayNameInput
): string => {
  if (
    hasAnyPassengerPassportValue(input) &&
    trimPassengerText(input.passportPassengerName)
  ) {
    return trimPassengerText(input.passportPassengerName);
  }

  if (trimPassengerText(input.panHolderName)) {
    return trimPassengerText(input.panHolderName);
  }

  if (trimPassengerText(input.paidByPanHolderName)) {
    return trimPassengerText(input.paidByPanHolderName);
  }

  return trimPassengerText(input.partyProfileName);
};

export const shouldShowPassportPassengerNameOnDocument = (
  input: PassengerIdentityValues
) =>
  hasAnyPassengerPassportValue(input) &&
  Boolean(trimPassengerText(input.passportPassengerName));
