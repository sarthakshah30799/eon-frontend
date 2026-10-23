export const TOUR_PASSENGER_TEXT = {
  button: 'Add tour passenger data',
  title: 'Tour passenger data',
  description:
    'The main passenger is the tour guide. These rows are the passengers on this sale.',
  upload: 'Upload Excel',
  addRow: 'Add row',
  removeRow: 'Remove',
  save: 'Save',
  cancel: 'Cancel',
  totalPrefix: 'Total FCN amount',
  uploadFailed: 'Could not read the tour passenger Excel file',
  currencyMissing: 'These FCN codes are not available on this sale',
} as const;

export const TOUR_PASSENGER_COLUMNS = [
  { name: 'passportNumber', label: 'Passport Number', kind: 'text' },
  { name: 'passportName', label: 'Name as per Passport', kind: 'text' },
  { name: 'placeOfIssue', label: 'Place of Issue', kind: 'text' },
  { name: 'dateOfIssue', label: 'Date of Issue', kind: 'date' },
  { name: 'dateOfExpiry', label: 'Date of Expiry', kind: 'date' },
  { name: 'panHolderRelationship', label: 'Relationship with PAN holder', kind: 'text' },
  { name: 'travellerPanNumber', label: 'Traveller PAN number', kind: 'text' },
  { name: 'panName', label: 'Name as per the PAN', kind: 'text' },
  { name: 'travellerDob', label: 'Traveller Date of Birth', kind: 'date' },
  { name: 'fcnCode', label: 'FCN CODE', kind: 'text' },
  { name: 'fcnAmount', label: 'FCN AMOUNT', kind: 'amount' },
  { name: 'contactNo', label: 'Contact No', kind: 'text' },
  { name: 'remark', label: 'REMARK', kind: 'text' },
  { name: 'otherAdExchangeDate', label: 'Date of Exchange with other AD/FFMC', kind: 'date' },
  { name: 'otherAdNameAddress', label: 'Name & Address of AD Branch /FFMC effected', kind: 'text' },
] as const;
