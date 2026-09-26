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

export type PassengerPanHolderRelationType = string;

export type PassengerAmlPartyProfile = Pick<
  IPartyProfile,
  | 'id'
  | 'code'
  | 'name'
  | 'type'
  | 'isIndividual'
  | 'panNo'
  | 'panName'
  | 'panDob'
  | 'phoneNo'
  | 'email'
  | 'address1'
  | 'address2'
  | 'address3'
  | 'city'
  | 'pinCode'
  | 'gstNo'
  | 'gstStateId'
  | 'stateId'
>;

export interface IPassengerAmlVerificationValues {
  entityType: PassengerEntityType;
  isIndianNationality: boolean;
  panNumber: string;
  panHolderName: string;
  panDob: string;
  passportPassengerName: string;
  passportNumber: string;
  passportIssueAt: string;
  passportIssueDate: string;
  passportExpiryDate: string;
}

export interface IPassengerPanVerificationRequest {
  entityType: PassengerEntityType;
  nationalityType: PassengerNationalityType;
  panNumber?: string;
  panHolderName?: string;
  panDob?: string;
  panHolderRelationType?: string;
}

export interface IPassengerPassportVerificationRequest {
  nationalityType: PassengerNationalityType;
  passportNumber?: string;
  passportPassengerName?: string;
  passportIssueAt?: string;
  passportIssueDate?: string;
  passportExpiryDate?: string;
  arrivalDate?: string;
  transactionDate?: string;
  isIndianNationality?: boolean;
}

export interface IPassengerOtherDocumentVerificationRequest {
  documentType: PassengerOtherIdProofType;
  documentNumber?: string;
  validTill?: string;
  issueAt?: string;
  issueDate?: string;
  expiryDate?: string;
}

export interface IPassengerAmlVerificationResponse {
  verified: boolean;
  message: string;
}

export interface IPassengerLookupReferenceSnapshot {
  id: string;
  code?: string | null;
  name?: string | null;
  label?: string | null;
}

/** Identity lookup payload returned by `/passengers/lookup-identity`. */
export interface IPassengerLookupSnapshot {
  id: string;
  entityType?: string | null;
  nationalityType?: string | null;
  countryId?: string | null;
  stateId?: string | null;
  locationId?: string | null;
  residentStatusId?: string | null;
  gstStateId?: string | null;
  passportNumber?: string | null;
  passportPassengerName?: string | null;
  passportIssueAt?: string | null;
  passportIssueDate?: string | null;
  passportExpiryDate?: string | null;
  arrivalDate?: string | null;
  panNumber?: string | null;
  panHolderName?: string | null;
  panDob?: string | null;
  panHolderRelationType?: string | null;
  paidByPanNumber?: string | null;
  paidByPanHolderName?: string | null;
  paidByPanDob?: string | null;
  gstNumber?: string | null;
  email?: string | null;
  contactNo?: string | null;
  city?: string | null;
  address1?: string | null;
  address2?: string | null;
  isPep?: boolean | null;
  country?: IPassengerLookupReferenceSnapshot | null;
  state?: IPassengerLookupReferenceSnapshot | null;
  gstState?: IPassengerLookupReferenceSnapshot | null;
  residentStatus?: IPassengerLookupReferenceSnapshot | null;
  location?: IPassengerLookupReferenceSnapshot | null;
}

export interface IPassengerPassportLookupResponse {
  found: boolean;
  message: string;
  passenger: IPassengerLookupSnapshot | null;
}

export interface IPassengerAmlVerifiedPayload {
  entityType: PassengerEntityType;
  isIndianNationality: boolean;
  panNumber: string;
  panHolderName: string;
  panDob: string;
  passportPassengerName: string;
  passportNumber: string;
  passportIssueAt: string;
  passportIssueDate: string;
  passportExpiryDate: string;
}

export interface IPassengerOtherDocumentDraft {
  documentType: PassengerOtherIdProofType | '';
  documentNumber: string;
  validTill: string;
  issueAt: string;
  issueDate: string;
  expiryDate: string;
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
  panHolderRelationType: string;
  paidByPanNumber: string;
  paidByPanHolderName: string;
  paidByPanDob: string;
  gstNumber: string;
  gstStateId: string;
  isPep: boolean;
  passportPassengerName: string;
  passportNumber: string;
  passportIssueAt: string;
  passportIssueDate: string;
  passportExpiryDate: string;
  arrivalDate: string;
  otherDocuments: IPassengerOtherDocumentDraft[];
}
