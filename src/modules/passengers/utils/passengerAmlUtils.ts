import * as yup from 'yup';
import {
  PassengerEntityTypeEnum,
  PassengerNationalityTypeEnum,
  PassengerOtherIdProofTypeEnum,
  PassengerPanHolderRelationTypeEnum,
  PassengerResidentStatusEnum,
  type PassengerEntityType,
  type PassengerAmlPartyProfile,
  type PassengerNationalityType,
  type PassengerOtherIdProofType,
  type PassengerPanHolderRelationType,
  type PassengerResidentStatus,
  type IPassengerAmlVerificationValues,
  type IPassengerPassengerDetailsValues,
} from '../types/passengerTypes';

export const createStaticPassengerSelectOptions = <
  T extends string,
>(options: ReadonlyArray<{ value: T; label: string }>) =>
  async () => ({ options: options.map(option => ({ ...option })) });

export const PASSENGER_NATIONALITY_OPTIONS = [
  { value: PassengerNationalityTypeEnum.INDIAN, label: 'Indian' },
  { value: PassengerNationalityTypeEnum.NRI, label: 'NRI' },
  { value: PassengerNationalityTypeEnum.FOREIGNER, label: 'Foreigner' },
] as const satisfies ReadonlyArray<{ value: PassengerNationalityType; label: string }>;

export const PASSENGER_RESIDENT_STATUS_OPTIONS = [
  { value: PassengerResidentStatusEnum.RESIDENT, label: 'Resident' },
  { value: PassengerResidentStatusEnum.NON_RESIDENT, label: 'Non Resident' },
  { value: PassengerResidentStatusEnum.FOREIGNER, label: 'Foreigner' },
] as const satisfies ReadonlyArray<{ value: PassengerResidentStatus; label: string }>;

export const PASSENGER_OTHER_ID_PROOF_OPTIONS = [
  { value: PassengerOtherIdProofTypeEnum.AADHAAR, label: 'Aadhaar' },
  { value: PassengerOtherIdProofTypeEnum.DRIVING_LICENSE, label: 'Driving License' },
  { value: PassengerOtherIdProofTypeEnum.PAN, label: 'PAN' },
  { value: PassengerOtherIdProofTypeEnum.VOTER_ID, label: 'Voter ID' },
] as const satisfies ReadonlyArray<{ value: PassengerOtherIdProofType; label: string }>;

export const PASSENGER_PAN_HOLDER_RELATION_OPTIONS = [
  { value: PassengerPanHolderRelationTypeEnum.COMPANY, label: 'Company' },
  { value: PassengerPanHolderRelationTypeEnum.INDIVIDUAL, label: 'Individual' },
] as const satisfies ReadonlyArray<{ value: PassengerPanHolderRelationType; label: string }>;

export const createPassengerAmlDefaultValues = (
  entityType: PassengerEntityType = PassengerEntityTypeEnum.CORPORATE,
  selectedPartyProfile?: PassengerAmlPartyProfile | null
): IPassengerAmlVerificationValues => {
  const resolvedPartyProfile = selectedPartyProfile ?? null;
  const resolvedEntityType =
    entityType === PassengerEntityTypeEnum.INDIVIDUAL
      ? PassengerEntityTypeEnum.INDIVIDUAL
      : PassengerEntityTypeEnum.CORPORATE;
  const shouldPrefillFromPartyProfile =
    resolvedEntityType === PassengerEntityTypeEnum.CORPORATE;

  return {
    entityType: resolvedEntityType,
    isIndianNationality: true,
    panNumber: shouldPrefillFromPartyProfile ? resolvedPartyProfile?.panNo ?? '' : '',
    panHolderName: shouldPrefillFromPartyProfile
      ? resolvedPartyProfile?.panName ?? resolvedPartyProfile?.name ?? ''
      : '',
    panDob: shouldPrefillFromPartyProfile ? resolvedPartyProfile?.panDob ?? '' : '',
    passportNumber: '',
    passportIssueAt: '',
    passportIssueDate: '',
    passportExpiryDate: '',
  };
};

export const createPassengerDetailsDefaultValues = (
  entityType: PassengerEntityType = PassengerEntityTypeEnum.CORPORATE,
  verifiedAmlValues?: IPassengerAmlVerificationValues | null
): IPassengerPassengerDetailsValues => {
  const resolvedEntityType =
    entityType === PassengerEntityTypeEnum.INDIVIDUAL
      ? PassengerEntityTypeEnum.INDIVIDUAL
      : PassengerEntityTypeEnum.CORPORATE;

  const isIndianNationality =
    verifiedAmlValues?.isIndianNationality ?? resolvedEntityType === PassengerEntityTypeEnum.CORPORATE;

  return {
    entityType: resolvedEntityType,
    nationalityType: isIndianNationality
      ? PassengerNationalityTypeEnum.INDIAN
      : PassengerNationalityTypeEnum.NRI,
    residentStatus: PassengerResidentStatusEnum.RESIDENT,
    countryId: '',
    stateId: '',
    locationId: '',
    city: '',
    address1: '',
    address2: '',
    email: '',
    contactNo: '',
    panNumber: verifiedAmlValues?.panNumber ?? '',
    panHolderName: verifiedAmlValues?.panHolderName ?? '',
    panDob: verifiedAmlValues?.panDob ?? '',
    panHolderRelationType:
      resolvedEntityType === PassengerEntityTypeEnum.CORPORATE
        ? PassengerPanHolderRelationTypeEnum.COMPANY
        : PassengerPanHolderRelationTypeEnum.INDIVIDUAL,
    paidByPanNumber: '',
    paidByPanHolderName: '',
    paidByPanDob: '',
    gstNumber: '',
    gstStateId: '',
    isPep: false,
    passportNumber: verifiedAmlValues?.passportNumber ?? '',
    passportIssueAt: verifiedAmlValues?.passportIssueAt ?? '',
    passportIssueDate: verifiedAmlValues?.passportIssueDate ?? '',
    passportExpiryDate: verifiedAmlValues?.passportExpiryDate ?? '',
    arrivalDate: '',
    otherDocuments: [
      {
        documentType: '',
        documentNumber: '',
        validTill: '',
        issueAt: '',
        issueDate: '',
        expiryDate: '',
        documentFile: '',
      },
    ],
  };
};

const isPanValidationRequired = (values: {
  entityType?: string;
  isIndianNationality?: boolean;
}) =>
  values.entityType === PassengerEntityTypeEnum.CORPORATE ||
  (values.entityType === PassengerEntityTypeEnum.INDIVIDUAL &&
    values.isIndianNationality !== false);

const isPassportValidationRequired = (values: {
  entityType?: string;
  isIndianNationality?: boolean;
}) =>
  values.entityType === PassengerEntityTypeEnum.INDIVIDUAL &&
  values.isIndianNationality === false;

const requiredText = (message: string) => yup.string().trim().required(message);

const optionalText = () =>
  yup.string().trim().default('');

export const createPassengerAmlVerificationSchema = () =>
  yup.object({
    entityType: yup
      .mixed<(typeof PassengerEntityTypeEnum)[keyof typeof PassengerEntityTypeEnum]>()
      .oneOf(Object.values(PassengerEntityTypeEnum))
      .required(),
    isIndianNationality: yup.boolean().required(),
    panNumber: optionalText().when(['entityType', 'isIndianNationality'], {
      is: (entityType: string, isIndianNationality: boolean) =>
        isPanValidationRequired({ entityType, isIndianNationality }),
      then: () => requiredText('PAN number is required'),
      otherwise: schema => schema.default(''),
    }),
    panHolderName: optionalText().when(['entityType', 'isIndianNationality'], {
      is: (entityType: string, isIndianNationality: boolean) =>
        isPanValidationRequired({ entityType, isIndianNationality }),
      then: () => requiredText('PAN holder name is required'),
      otherwise: schema => schema.default(''),
    }),
    panDob: yup.string().trim().when(['entityType', 'isIndianNationality'], {
      is: (entityType: string, isIndianNationality: boolean) =>
        isPanValidationRequired({ entityType, isIndianNationality }),
      then: schema => schema.required('PAN holder DOB is required'),
      otherwise: schema => schema.default(''),
    }),
    passportNumber: optionalText().when(['entityType', 'isIndianNationality'], {
      is: (entityType: string, isIndianNationality: boolean) =>
        isPassportValidationRequired({ entityType, isIndianNationality }),
      then: schema => schema.required('Passport number is required'),
      otherwise: schema => schema.default(''),
    }),
    passportIssueAt: optionalText().when(['entityType', 'isIndianNationality'], {
      is: (entityType: string, isIndianNationality: boolean) =>
        isPassportValidationRequired({ entityType, isIndianNationality }),
      then: schema => schema.required('Passport issue place is required'),
      otherwise: schema => schema.default(''),
    }),
    passportIssueDate: yup.string().trim().when(['entityType', 'isIndianNationality'], {
      is: (entityType: string, isIndianNationality: boolean) =>
        isPassportValidationRequired({ entityType, isIndianNationality }),
      then: schema => schema.required('Passport issue date is required'),
      otherwise: schema => schema.default(''),
    }),
    passportExpiryDate: yup.string().trim().when(['entityType', 'isIndianNationality'], {
      is: (entityType: string, isIndianNationality: boolean) =>
        isPassportValidationRequired({ entityType, isIndianNationality }),
      then: schema =>
        schema
          .required('Passport expiry date is required')
          .test('passport-date-order', 'Passport expiry date must be after issue date', function (value) {
            const issueDate = this.parent.passportIssueDate as string | undefined;
            if (!issueDate || !value) {
              return true;
            }

            return new Date(value) >= new Date(issueDate);
          }),
      otherwise: schema => schema.default(''),
    }),
  });

const isPassengerPanValidationRequired = (values: {
  entityType?: string;
  nationalityType?: string;
}) =>
  values.entityType === PassengerEntityTypeEnum.CORPORATE ||
  values.nationalityType === PassengerNationalityTypeEnum.INDIAN;

const isPassengerPassportValidationRequired = (values: {
  nationalityType?: string;
}) =>
  values.nationalityType === PassengerNationalityTypeEnum.NRI ||
  values.nationalityType === PassengerNationalityTypeEnum.FOREIGNER;

const isPassengerOtherDocumentsRequired = (nationalityType?: string) =>
  nationalityType === PassengerNationalityTypeEnum.INDIAN;

const passengerOtherDocumentSchema = yup
  .object({
    documentType: yup
      .mixed<PassengerOtherIdProofType | ''>()
      .oneOf([...Object.values(PassengerOtherIdProofTypeEnum), ''] as const)
      .required('Document type is required'),
    documentNumber: optionalText().when('documentType', {
      is: (documentType: string) => Boolean(documentType),
      then: schema => schema.required('Document number is required'),
      otherwise: schema => schema.default(''),
    }),
    validTill: yup.string().trim().default('').when('documentType', {
      is: (documentType: string) => Boolean(documentType),
      then: schema => schema.required('Valid till is required'),
      otherwise: schema => schema.default(''),
    }),
    documentFile: yup.string().trim().default(''),
  })
  .required();

export const createPassengerDetailsSchema = () =>
  yup.object({
    entityType: yup
      .mixed<(typeof PassengerEntityTypeEnum)[keyof typeof PassengerEntityTypeEnum]>()
      .oneOf(Object.values(PassengerEntityTypeEnum))
      .required(),
    nationalityType: yup
      .mixed<PassengerNationalityType | ''>()
      .oneOf([...Object.values(PassengerNationalityTypeEnum), ''] as const)
      .required('Nationality is required'),
    residentStatus: yup
      .mixed<PassengerResidentStatus | ''>()
      .oneOf([...Object.values(PassengerResidentStatusEnum), ''] as const)
      .required('Resident status is required'),
    countryId: yup.string().trim().required('Country is required'),
    stateId: yup.string().trim().default(''),
    locationId: yup.string().trim().default(''),
    city: yup.string().trim().default(''),
    address1: yup.string().trim().default(''),
    address2: yup.string().trim().default(''),
    email: yup.string().trim().default(''),
    contactNo: yup.string().trim().default(''),
    panNumber: optionalText().when(['entityType', 'nationalityType'], {
      is: (entityType: string, nationalityType: string) =>
        isPassengerPanValidationRequired({ entityType, nationalityType }),
      then: () => requiredText('PAN number is required'),
      otherwise: schema => schema.default(''),
    }),
    panHolderName: optionalText().when(['entityType', 'nationalityType'], {
      is: (entityType: string, nationalityType: string) =>
        isPassengerPanValidationRequired({ entityType, nationalityType }),
      then: () => requiredText('PAN holder name is required'),
      otherwise: schema => schema.default(''),
    }),
    panDob: yup.string().trim().when(['entityType', 'nationalityType'], {
      is: (entityType: string, nationalityType: string) =>
        isPassengerPanValidationRequired({ entityType, nationalityType }),
      then: schema => schema.required('PAN holder DOB is required'),
      otherwise: schema => schema.default(''),
    }),
    panHolderRelationType: yup
      .mixed<PassengerPanHolderRelationType | ''>()
      .oneOf([...Object.values(PassengerPanHolderRelationTypeEnum), ''] as const)
      .required('PAN holder relation is required'),
    paidByPanNumber: optionalText(),
    paidByPanHolderName: optionalText(),
    paidByPanDob: yup.string().trim().default(''),
    gstNumber: yup.string().trim().default(''),
    gstStateId: yup.string().trim().default(''),
    isPep: yup.boolean().default(false),
    passportNumber: optionalText().when('nationalityType', {
      is: (nationalityType: string) =>
        isPassengerPassportValidationRequired({ nationalityType }),
      then: schema => schema.required('Passport number is required'),
      otherwise: schema => schema.default(''),
    }),
    passportIssueAt: optionalText().when('nationalityType', {
      is: (nationalityType: string) =>
        isPassengerPassportValidationRequired({ nationalityType }),
      then: schema => schema.required('Passport issue place is required'),
      otherwise: schema => schema.default(''),
    }),
    passportIssueDate: yup.string().trim().when('nationalityType', {
      is: (nationalityType: string) =>
        isPassengerPassportValidationRequired({ nationalityType }),
      then: schema => schema.required('Passport issue date is required'),
      otherwise: schema => schema.default(''),
    }),
    passportExpiryDate: yup.string().trim().when('nationalityType', {
      is: (nationalityType: string) =>
        isPassengerPassportValidationRequired({ nationalityType }),
      then: schema =>
        schema
          .required('Passport expiry date is required')
          .test('passport-date-order', 'Passport expiry date must be after issue date', function (value) {
            const issueDate = this.parent.passportIssueDate as string | undefined;
            if (!issueDate || !value) {
              return true;
            }

            return new Date(value) >= new Date(issueDate);
          }),
      otherwise: schema => schema.default(''),
    }),
    arrivalDate: yup.string().trim().when('nationalityType', {
      is: (nationalityType: string) =>
        isPassengerPassportValidationRequired({ nationalityType }),
      then: schema => schema.required('Arrival date is required'),
      otherwise: schema => schema.default(''),
    }),
    otherDocuments: yup
      .array()
      .of(passengerOtherDocumentSchema)
      .when('nationalityType', {
        is: (nationalityType: string) => isPassengerOtherDocumentsRequired(nationalityType),
        then: schema => schema.min(1, 'At least one other document is required'),
        otherwise: schema => schema.default([]),
      }),
  });
