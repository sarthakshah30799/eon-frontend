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

export const CARD_STOCK_PRINT_RATE = 1;

export const CARD_STOCK_PRINT_TEXT = {
  titleStockIn: 'CARD STOCK IN',
  titleStockOut: 'CARD STOCK OUT',
  originalCopy: 'Original Copy',
  duplicateCopy: 'Duplicate Copy',
  printOriginal: 'Print Original Copy',
  printDuplicate: 'Print Duplicate Copy',
  printStockInOriginal: 'Print Stock In (Original)',
  printStockInDuplicate: 'Print Stock In (Duplicate)',
  printStockOutOriginal: 'Print Stock Out (Original)',
  printStockOutDuplicate: 'Print Stock Out (Duplicate)',
  preparing: 'Preparing Print...',
  companyBranch: 'Company & Branch Information',
  receivedFrom: 'Received From',
  transferredTo: 'Transferred To',
  cardDetails: 'CARD Details',
  srNo: 'Sr. No.',
  currency: 'Currency',
  product: 'Product',
  kitNumber: 'Kit Number',
  cardNumber: 'Card Number',
  feAmount: 'FE Amount',
  per: 'Per',
  rate: 'Rate',
  amount: 'Amount',
  noCards: 'No CARD items',
  cards: 'Cards',
  totalFe: 'Total FE Amount',
  totalAmount: 'Total Amount',
  amountInWords: 'Total Amount in Words',
  footerNote: 'Original for records and Duplicate for file',
  receivedBy: 'Received By',
  issuedBy: 'Issued By',
  authorizedSignatory: 'Authorized Signatory',
  documentNo: 'Document No',
  documentDate: 'Document Date',
  branchGst: 'Branch GST',
  panNo: 'PAN No',
  address: 'Address',
  contact: 'Contact',
  email: 'Email',
  name: 'Name',
  popupBlocked: 'Unable to open print window. Please allow pop-ups and try again.',
  printFailed: 'Failed to print CARD stock copy',
  printed: (label: string) => `${label} sent to printer`,
} as const;

