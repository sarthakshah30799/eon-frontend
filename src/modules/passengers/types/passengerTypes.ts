import type { IPartyProfile } from '@/modules/partyProfiles/types';

export const PassengerEntityTypeEnum = {
  CORPORATE: 'CORPORATE',
  INDIVIDUAL: 'INDIVIDUAL',
} as const;

export type PassengerEntityType =
  (typeof PassengerEntityTypeEnum)[keyof typeof PassengerEntityTypeEnum];

export const PassengerNationalityTypeEnum = {
  INDIAN: 'INDIAN',
  NRI: 'NRI',
  FOREIGNER: 'FOREIGNER',
} as const;

export type PassengerNationalityType =
  (typeof PassengerNationalityTypeEnum)[keyof typeof PassengerNationalityTypeEnum];

export const PassengerResidentStatusEnum = {
  RESIDENT: 'RESIDENT',
  NON_RESIDENT: 'NON_RESIDENT',
  FOREIGNER: 'FOREIGNER',
} as const;

export type PassengerResidentStatus =
  (typeof PassengerResidentStatusEnum)[keyof typeof PassengerResidentStatusEnum];

export const PassengerOtherIdProofTypeEnum = {
  AADHAAR: 'AADHAAR',
  DRIVING_LICENSE: 'DRIVING_LICENSE',
  PAN: 'PAN',
  VOTER_ID: 'VOTER_ID',
} as const;

export type PassengerOtherIdProofType =
  (typeof PassengerOtherIdProofTypeEnum)[keyof typeof PassengerOtherIdProofTypeEnum];

export const PassengerPanHolderRelationTypeEnum = {
  COMPANY: 'COMPANY',
  INDIVIDUAL: 'INDIVIDUAL',
} as const;

export type PassengerPanHolderRelationType =
  (typeof PassengerPanHolderRelationTypeEnum)[keyof typeof PassengerPanHolderRelationTypeEnum];

export type PassengerAmlPartyProfile = Pick<
  IPartyProfile,
  'id' | 'code' | 'name' | 'type' | 'isIndividual' | 'panNo' | 'panName' | 'panDob'
>;

export interface IPassengerAmlVerificationValues {
  entityType: PassengerEntityType;
  isIndianNationality: boolean;
  panNumber: string;
  panHolderName: string;
  panDob: string;
  passportNumber: string;
  passportIssueAt: string;
  passportIssueDate: string;
  passportExpiryDate: string;
}

export interface IPassengerAmlVerifiedPayload {
  entityType: PassengerEntityType;
  isIndianNationality: boolean;
  panNumber: string;
  panHolderName: string;
  panDob: string;
  passportNumber: string;
  passportIssueAt: string;
  passportIssueDate: string;
  passportExpiryDate: string;
}

export interface IPassengerOtherDocumentDraft {
  documentType: PassengerOtherIdProofType | '';
  documentNumber: string;
  validTill: string;
  documentFile: string;
}

export interface IPassengerPassengerDetailsValues {
  entityType: PassengerEntityType;
  nationalityType: PassengerNationalityType | '';
  residentStatus: PassengerResidentStatus | '';
  countryId: string;
  stateId: string;
  locationId: string;
  city: string;
  address1: string;
  address2: string;
  email: string;
  contactNo: string;
  panNumber: string;
  panHolderName: string;
  panDob: string;
  panHolderRelationType: PassengerPanHolderRelationType | '';
  paidByPanNumber: string;
  paidByPanHolderName: string;
  paidByPanDob: string;
  gstNumber: string;
  gstStateId: string;
  isPep: boolean;
  passportNumber: string;
  passportIssueAt: string;
  passportIssueDate: string;
  passportExpiryDate: string;
  arrivalDate: string;
  otherDocuments: IPassengerOtherDocumentDraft[];
}
