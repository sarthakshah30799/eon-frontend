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
  type IPassengerAmlVerificationValues,
  type IPassengerPassengerDetailsValues,
} from '../types/passengerTypes';

export const PASSENGER_PAN_VERIFICATION_FIELDS = [
  'panNumber',
  'panHolderName',
  'panDob',
  'panHolderRelationType',
  'corporatePanNumber',
  'corporatePanHolderName',
  'corporatePanDob',
  'corporatePanHolderRelationType',
] as const;

export const PASSENGER_PASSPORT_VERIFICATION_FIELDS = [
  'passportNumber',
  'passportIssueAt',
  'passportIssueDate',
  'passportExpiryDate',
  'arrivalDate',
] as const;

export const PASSENGER_OTHER_DOCUMENT_FIELDS = [
  'otherDocuments.0.documentType',
  'otherDocuments.0.documentNumber',
  'otherDocuments.0.validTill',
] as const;

const isPanValidationRequired = (values: {
  entityType?: string;
  nationalityType?: string;
}) =>
  values.entityType === PassengerEntityTypeEnum.CORPORATE ||
  (values.entityType === PassengerEntityTypeEnum.INDIVIDUAL &&
    values.nationalityType === PassengerNationalityTypeEnum.INDIAN);

const isPassportValidationRequired = (values: {
  entityType?: string;
  nationalityType?: string;
}) =>
  values.nationalityType !== PassengerNationalityTypeEnum.INDIAN;

const requiredText = (message: string) => yup.string().trim().required(message);

const optionalText = () => yup.string().trim().default('');

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
    issueAt: yup.string().trim().default(''),
    issueDate: yup.string().trim().default(''),
    expiryDate: yup.string().trim().default(''),
  })
  .required();

export const createPassengerPanVerificationSchema = () =>
  yup.object({
    entityType: yup
      .mixed<(typeof PassengerEntityTypeEnum)[keyof typeof PassengerEntityTypeEnum]>()
      .oneOf(Object.values(PassengerEntityTypeEnum))
      .required(),
    nationalityType: yup
      .mixed<PassengerNationalityType>()
      .oneOf(Object.values(PassengerNationalityTypeEnum) as PassengerNationalityType[])
      .required(),
    panNumber: optionalText().when(['entityType', 'nationalityType'], {
      is: (entityType: string, nationalityType: string) =>
        isPanValidationRequired({ entityType, nationalityType }),
      then: () => requiredText('PAN number is required'),
      otherwise: schema => schema.default(''),
    }),
    panHolderName: optionalText().when(['entityType', 'nationalityType'], {
      is: (entityType: string, nationalityType: string) =>
        isPanValidationRequired({ entityType, nationalityType }),
      then: () => requiredText('PAN holder name is required'),
      otherwise: schema => schema.default(''),
    }),
    panDob: yup.string().trim().when(['entityType', 'nationalityType'], {
      is: (entityType: string, nationalityType: string) =>
        isPanValidationRequired({ entityType, nationalityType }),
      then: schema => schema.required('PAN holder DOB is required'),
      otherwise: schema => schema.default(''),
    }),
    panHolderRelationType: yup
      .mixed<PassengerPanHolderRelationType | ''>()
      .oneOf([...Object.values(PassengerPanHolderRelationTypeEnum), ''] as const)
      .default(''),
    corporatePanNumber: optionalText(),
    corporatePanHolderName: optionalText(),
    corporatePanDob: yup.string().trim().default(''),
    corporatePanHolderRelationType: yup
      .mixed<PassengerPanHolderRelationType | ''>()
      .oneOf([...Object.values(PassengerPanHolderRelationTypeEnum), ''] as const)
      .default(''),
  });

export const createPassengerPassportVerificationSchema = () =>
  yup.object({
    nationalityType: yup
      .mixed<PassengerNationalityType>()
      .oneOf(Object.values(PassengerNationalityTypeEnum) as PassengerNationalityType[])
      .required(),
    passportNumber: optionalText().when('nationalityType', {
      is: (nationalityType: string) =>
        isPassportValidationRequired({ nationalityType }),
      then: schema => schema.required('Passport number is required'),
      otherwise: schema => schema.default(''),
    }),
    passportIssueAt: optionalText().when('nationalityType', {
      is: (nationalityType: string) =>
        isPassportValidationRequired({ nationalityType }),
      then: schema => schema.required('Passport issue place is required'),
      otherwise: schema => schema.default(''),
    }),
    passportIssueDate: yup.string().trim().when('nationalityType', {
      is: (nationalityType: string) =>
        isPassportValidationRequired({ nationalityType }),
      then: schema => schema.required('Passport issue date is required'),
      otherwise: schema => schema.default(''),
    }),
    passportExpiryDate: yup.string().trim().when('nationalityType', {
      is: (nationalityType: string) =>
        isPassportValidationRequired({ nationalityType }),
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
        isPassportValidationRequired({ nationalityType }),
      then: schema => schema.required('Arrival date is required'),
      otherwise: schema => schema.default(''),
    }),
    isIndianNationality: yup.boolean().required(),
  });

export const createPassengerOtherDocumentVerificationSchema = () =>
  yup.object({
    otherDocuments: yup
      .array()
      .of(passengerOtherDocumentSchema)
      .min(1, 'At least one document is required')
      .required(),
  });

export const createPassengerAmlDefaultValues = (
  entityType: PassengerEntityType = PassengerEntityTypeEnum.CORPORATE,
  selectedPartyProfile?: { panNo?: string | null; panName?: string | null; name?: string | null; panDob?: string | null } | null,
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
  verifiedAmlValues?: IPassengerAmlVerificationValues | null,
  selectedPartyProfile?: PassengerAmlPartyProfile | null,
): IPassengerPassengerDetailsValues => {
  const resolvedEntityType =
    entityType === PassengerEntityTypeEnum.INDIVIDUAL
      ? PassengerEntityTypeEnum.INDIVIDUAL
      : PassengerEntityTypeEnum.CORPORATE;

  const isIndianNationality =
    verifiedAmlValues?.isIndianNationality ?? resolvedEntityType === PassengerEntityTypeEnum.CORPORATE;
  const shouldPrefillFromPartyProfile =
    resolvedEntityType === PassengerEntityTypeEnum.CORPORATE && Boolean(selectedPartyProfile);

  return {
    entityType: resolvedEntityType,
    nationalityType: isIndianNationality
      ? PassengerNationalityTypeEnum.INDIAN
      : PassengerNationalityTypeEnum.NRI,
    residentStatus: PassengerResidentStatusEnum.RESIDENT,
    countryId: '',
    stateId: shouldPrefillFromPartyProfile
      ? selectedPartyProfile?.stateId ?? selectedPartyProfile?.gstStateId ?? ''
      : '',
    locationId: '',
    city: shouldPrefillFromPartyProfile ? selectedPartyProfile?.city ?? '' : '',
    address1: shouldPrefillFromPartyProfile ? selectedPartyProfile?.address1 ?? '' : '',
    address2: shouldPrefillFromPartyProfile ? selectedPartyProfile?.address2 ?? '' : '',
    email: shouldPrefillFromPartyProfile ? selectedPartyProfile?.email ?? '' : '',
    contactNo: shouldPrefillFromPartyProfile ? selectedPartyProfile?.phoneNo ?? '' : '',
    panNumber: verifiedAmlValues?.panNumber ?? '',
    panHolderName: verifiedAmlValues?.panHolderName ?? '',
    panDob: verifiedAmlValues?.panDob ?? '',
    panHolderRelationType:
      resolvedEntityType === PassengerEntityTypeEnum.CORPORATE
        ? PassengerPanHolderRelationTypeEnum.COMPANY
        : PassengerPanHolderRelationTypeEnum.INDIVIDUAL,
    paidByPanNumber: shouldPrefillFromPartyProfile ? selectedPartyProfile?.panNo ?? '' : '',
    paidByPanHolderName: shouldPrefillFromPartyProfile
      ? selectedPartyProfile?.panName ?? selectedPartyProfile?.name ?? ''
      : '',
    paidByPanDob: shouldPrefillFromPartyProfile ? selectedPartyProfile?.panDob ?? '' : '',
    gstNumber: shouldPrefillFromPartyProfile ? selectedPartyProfile?.gstNo ?? '' : '',
    gstStateId: shouldPrefillFromPartyProfile ? selectedPartyProfile?.gstStateId ?? '' : '',
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
