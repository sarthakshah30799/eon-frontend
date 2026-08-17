export const DEFAULT_CARD_NUMBER_LENGTH = 16;
export const MIN_CARD_NUMBER_LENGTH = 8;
export const MAX_CARD_NUMBER_LENGTH = 19;

export const CARD_STOCK_UPLOAD_TEXT = {
  heading: (itemIndex: number) => `Upload Cards for Item ${itemIndex + 1}`,
  fileLabel: 'CSV / Excel file',
  placeholder: 'Choose card stock file',
  helperText: 'Upload kit numbers and card numbers for this item. CSV and Excel files are parsed on the server.',
  downloadTemplate: 'Download Template',
  useValidRows: 'Use Valid Rows',
  readFailed: 'Unable to read this file.',
} as const;

export const CARD_STOCK_VALIDATION_TEXT = {
  series: 'Series prefix must be 1 to 4 alphanumeric characters (for example, CC)',
  kitNumber: 'Kit number is required',
  denomination: 'Denomination must be greater than zero',
  expirationFormat: 'Expiration date must use dd/mm/yyyy format',
  expirationFuture: 'Expiration date must be in the future',
  digits: (length: number) => `Card number must be ${length} digits`,
  mask: (length: number) => `Card number must be a ${length}-character mask`,
  digitsOrMask: (length: number) => `Card number must be ${length} digits or a ${length}-character mask`,
} as const;
