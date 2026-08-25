import {
  PassengerEntityTypeEnum,
  PassengerNationalityTypeEnum,
} from '../types/passengerTypes';
import { isPassengerOtherDocumentComplete } from './passengerOtherDocumentRules';
import { PASSENGER_IDENTITY_TEXT } from '../constants/passengerConstants';

type PassengerIdentityValues = {
  entityType?: string | null;
  nationalityType?: string | null;
  panNumber?: string | null;
  panHolderName?: string | null;
  panDob?: string | null;
  panHolderRelationType?: string | null;
  passportNumber?: string | null;
  passportIssueAt?: string | null;
  passportIssueDate?: string | null;
  passportExpiryDate?: string | null;
  arrivalDate?: string | null;
  otherDocuments?: Array<Record<string, unknown> | null | undefined> | null;
};

const trim = (value?: string | null) => String(value ?? '').trim();

const isIndianNationality = (values: PassengerIdentityValues) =>
  values.nationalityType === PassengerNationalityTypeEnum.INDIAN;

const isCorporateEntity = (values: PassengerIdentityValues) =>
  values.entityType === PassengerEntityTypeEnum.CORPORATE;

const isForeignNationality = (values: PassengerIdentityValues) =>
  values.nationalityType === PassengerNationalityTypeEnum.NRI ||
  values.nationalityType === PassengerNationalityTypeEnum.FOREIGNER;

export const hasCompletePassengerPanValues = (values: PassengerIdentityValues) =>
  Boolean(trim(values.panNumber) && trim(values.panHolderName) && trim(values.panDob));

export const hasAnyPassengerPanValue = (values: PassengerIdentityValues) =>
  Boolean(trim(values.panNumber) || trim(values.panHolderName) || trim(values.panDob));

export const hasCompletePassengerPassportValues = (
  values: PassengerIdentityValues
) =>
  Boolean(
    trim(values.passportNumber) &&
      trim(values.passportIssueAt) &&
      trim(values.passportIssueDate) &&
      trim(values.passportExpiryDate)
  );

export const hasAnyPassengerPassportValue = (values: PassengerIdentityValues) =>
  Boolean(
    trim(values.passportNumber) ||
      trim(values.passportIssueAt) ||
      trim(values.passportIssueDate) ||
      trim(values.passportExpiryDate)
  );

export const hasCompletePassengerOtherDocuments = (
  values: PassengerIdentityValues
) => (values.otherDocuments ?? []).some(row => isPassengerOtherDocumentComplete(row));

export const isPassengerPanRequired = (values: PassengerIdentityValues) => {
  if (isCorporateEntity(values)) {
    return true;
  }

  if (!isIndianNationality(values)) {
    return false;
  }

  if (hasAnyPassengerPanValue(values)) {
    return true;
  }

  return (
    !hasCompletePassengerPassportValues(values) &&
    !hasCompletePassengerOtherDocuments(values)
  );
};

export const isPassengerPanHolderRelationRequired = (
  values: PassengerIdentityValues
) => isPassengerPanRequired(values);

export const isPassengerPassportRequired = (values: PassengerIdentityValues) => {
  if (isForeignNationality(values)) {
    return true;
  }

  if (!isIndianNationality(values)) {
    return false;
  }

  return hasAnyPassengerPassportValue(values);
};

export const isPassengerArrivalDateRequired = (values: PassengerIdentityValues) =>
  isForeignNationality(values);

export const isPassengerOtherDocumentsRequired = (
  values: PassengerIdentityValues
) => {
  if (!isIndianNationality(values)) {
    return false;
  }

  return (
    !hasCompletePassengerPanValues(values) &&
    !hasCompletePassengerPassportValues(values)
  );
};

export const isIndianPassengerIdentitySatisfied = (
  values: PassengerIdentityValues
) => {
  if (!isIndianNationality(values)) {
    return true;
  }

  if (isCorporateEntity(values)) {
    return hasCompletePassengerPanValues(values);
  }

  return (
    hasCompletePassengerPanValues(values) ||
    hasCompletePassengerPassportValues(values) ||
    hasCompletePassengerOtherDocuments(values)
  );
};

export const getPassengerPanNumberError = (values: PassengerIdentityValues) => {
  if (trim(values.panNumber)) {
    return undefined;
  }

  if (!isPassengerPanRequired(values)) {
    return undefined;
  }

  if (
    !isCorporateEntity(values) &&
    isIndianNationality(values) &&
    !hasAnyPassengerPanValue(values)
  ) {
    return PASSENGER_IDENTITY_TEXT.indianIdentityRequired;
  }

  return PASSENGER_IDENTITY_TEXT.panNumberRequired;
};
