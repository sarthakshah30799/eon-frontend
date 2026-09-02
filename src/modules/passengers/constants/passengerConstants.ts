export const PASSENGER_IDENTITY_TEXT = {
  panNumberRequired: 'PAN number is required',
  panHolderNameRequired: 'PAN holder name is required',
  panDobRequired: 'PAN holder DOB is required',
  panHolderRelationRequired: 'PAN holder relation is required',
  indianIdentityRequired: 'Enter PAN, passport, or at least one other document',
  otherDocumentsOptional: 'Required only if PAN and passport are not provided.',
  otherDocumentsRequired: 'At least one other document is required',
  passportNumberRequired: 'Passport number is required',
  passportIssuePlaceRequired: 'Passport issue place is required',
  passportIssueDateRequired: 'Passport issue date is required',
  passportExpiryDateRequired: 'Passport expiry date is required',
  arrivalDateRequired: 'Arrival date is required',
  arrivalDateHelper:
    'Required for NRI and foreign passengers. This is the date they entered India, not a passport detail.',
  passportOptionalHelper:
    'Passport stays visible for every passenger and is required for NRI or foreign residents.',
  passportNumberInvalid: 'Passport number must be 8 alphanumeric characters',
  travelTicketNoInvalid: 'Ticket number must be 13 numeric characters',
  aadhaarNumberInvalid: 'Aadhaar number must be 12 numeric characters',
} as const;
