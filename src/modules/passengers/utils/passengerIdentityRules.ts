import {
  PassengerEntityTypeEnum,
  PassengerNationalityTypeEnum,
  PassengerOtherIdProofTypeEnum,
} from '../types/passengerTypes';
import { TransactionTypeEnum } from '@/modules/transactions';
import { isCorporateIndividualPurchasePage } from '@/pages/purchase/[slug]/purchasePage.enum';
import type { PurchasePageType } from '@/pages/purchase/[slug]/purchasePage.enum';
import { isPassengerOtherDocumentComplete } from './passengerOtherDocumentRules';
import { PASSENGER_IDENTITY_TEXT } from '../constants/passengerConstants';

export const PASSPORT_NUMBER_PATTERN = /^[A-Z0-9]{8}$/i;
export const TRAVEL_TICKET_NUMBER_PATTERN = /^\d{13}$/;
export const AADHAAR_NUMBER_PATTERN = /^\d{12}$/;

const hasIdentityFieldValue = (value?: string | null) =>
  Boolean(String(value ?? '').trim());

export const isPassengerTravelTicketFieldVisible = (values: {
  transactionType?: string | null;
  entityType?: string | null;
}) => {
  if (values.transactionType !== TransactionTypeEnum.SALE) {
    return false;
  }

  return (
    values.entityType === PassengerEntityTypeEnum.CORPORATE ||
    values.entityType === PassengerEntityTypeEnum.INDIVIDUAL
  );
};

export const getPassengerPassportNumberFormatError = (
  passportNumber?: string | null
) => {
  if (!hasIdentityFieldValue(passportNumber)) {
    return undefined;
  }

  if (!PASSPORT_NUMBER_PATTERN.test(String(passportNumber).trim())) {
    return PASSENGER_IDENTITY_TEXT.passportNumberInvalid;
  }

  return undefined;
};

export const getTravelTicketNumberFormatError = (
  travelTicketNo?: string | null
) => {
  if (!hasIdentityFieldValue(travelTicketNo)) {
    return undefined;
  }

  if (!TRAVEL_TICKET_NUMBER_PATTERN.test(String(travelTicketNo).trim())) {
    return PASSENGER_IDENTITY_TEXT.travelTicketNoInvalid;
  }

  return undefined;
};

export const isValidPassportNumberFormat = (value?: string | null) =>
  !getPassengerPassportNumberFormatError(value);

export const isValidTravelTicketNumberFormat = (value?: string | null) =>
  !getTravelTicketNumberFormatError(value);

export const isValidAadhaarNumberFormat = (value?: string | null) =>
  !hasIdentityFieldValue(value) ||
  AADHAAR_NUMBER_PATTERN.test(String(value).trim());

export const getPassengerOtherDocumentNumberFormatError = (
  documentType?: string | null,
  documentNumber?: string | null
) => {
  if (!hasIdentityFieldValue(documentNumber)) {
    return undefined;
  }

  const normalizedType = String(documentType ?? '')
    .trim()
    .toUpperCase();

  if (
    normalizedType === PassengerOtherIdProofTypeEnum.AADHAAR &&
    !isValidAadhaarNumberFormat(documentNumber)
  ) {
    return PASSENGER_IDENTITY_TEXT.aadhaarNumberInvalid;
  }

  return undefined;
};

type PassengerDetailsFormatValues = {
  purchasePageType?: PurchasePageType | null;
  transactionType?: string | null;
  entityType?: string | null;
  passportNumber?: string | null;
  travelTicketNo?: string | null;
  otherDocuments?: Array<{
    documentType?: string | null;
    documentNumber?: string | null;
  } | null> | null;
};

export const applyPassengerDetailsFormatErrors = (
  values: PassengerDetailsFormatValues,
  setError: (field: string, error: { type: string; message: string }) => void
) => {
  if (!isCorporateIndividualPurchasePage(values.purchasePageType)) {
    return true;
  }

  let isValid = true;

  const passportFormatError = getPassengerPassportNumberFormatError(
    values.passportNumber
  );
  if (passportFormatError) {
    setError('passportNumber', {
      type: 'manual',
      message: passportFormatError,
    });
    isValid = false;
  }

  if (isPassengerTravelTicketFieldVisible(values)) {
    const travelTicketFormatError = getTravelTicketNumberFormatError(
      values.travelTicketNo
    );
    if (travelTicketFormatError) {
      setError('travelTicketNo', {
        type: 'manual',
        message: travelTicketFormatError,
      });
      isValid = false;
    }
  }

  (values.otherDocuments ?? []).forEach((document, index) => {
    const documentFormatError = getPassengerOtherDocumentNumberFormatError(
      document?.documentType,
      document?.documentNumber
    );

    if (!documentFormatError) {
      return;
    }

    setError(`otherDocuments.${index}.documentNumber`, {
      type: 'manual',
      message: documentFormatError,
    });
    isValid = false;
  });

  return isValid;
};

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

export const hasCompletePassengerPanValues = (
  values: PassengerIdentityValues
) =>
  Boolean(
    trim(values.panNumber) && trim(values.panHolderName) && trim(values.panDob)
  );

export const hasAnyPassengerPanValue = (values: PassengerIdentityValues) =>
  Boolean(
    trim(values.panNumber) || trim(values.panHolderName) || trim(values.panDob)
  );

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
) =>
  (values.otherDocuments ?? []).some(row =>
    isPassengerOtherDocumentComplete(row)
  );

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

export const isPassengerPassportRequired = (
  values: PassengerIdentityValues
) => {
  if (isForeignNationality(values)) {
    return true;
  }

  if (!isIndianNationality(values)) {
    return false;
  }

  return hasAnyPassengerPassportValue(values);
};

export const isPassengerArrivalDateRequired = (
  values: PassengerIdentityValues
) => isForeignNationality(values);

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
