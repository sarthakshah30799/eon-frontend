export const TT_PRODUCT_CODE = 'TT';

export const TT_REPORT_TEXT = {
  title: 'INDUS TT Report',
  description:
    'TT remittance rows for the selected dates. Block Data after generating Reports marks those rows so the next report can skip them. Show Blocked Data Also includes rows that were already marked. Show Before HO Acceptance keeps only TT surrender rows sent from the branch to HO and not yet accepted.',
  branchHeading: 'Branch',
  productHeading: 'Product',
  issuerHeading: 'Issuer',
  allProducts: 'Select TT product',
  allIssuers: 'All issuers',
  blockAfter: 'Block Data after generating Reports?',
  showBlocked: 'Show Blocked Data Also',
  showBeforeHo: 'Show Before HO Acceptance',
  view: 'View',
  reset: 'Reset',
  appliedPrefix: 'Showing',
  all: 'All',
  reportViewTitle: 'INDUS TT Report',
  xlsx: 'XLSX',
  csv: 'CSV',
  download: 'Download',
  loadError: 'Unable to load the TT Report.',
  empty: 'No TT transactions in this date range.',
} as const;

export const IDFC_TT_REPORT_TEXT = {
  ...TT_REPORT_TEXT,
  title: 'IDFC TT Report',
  reportViewTitle: 'IDFC TT Report',
  loadError: 'Unable to load the IDFC TT Report.',
  empty: 'No IDFC TT transactions in this date range.',
} as const;

export const ICICI_TT_REPORT_TEXT = {
  ...TT_REPORT_TEXT,
  title: 'ICICI TT Report',
  reportViewTitle: 'ICICI TT Report',
  loadError: 'Unable to load the ICICI TT Report.',
  empty: 'Coming soon',
} as const;

export const YES_TT_REPORT_TEXT = {
  ...TT_REPORT_TEXT,
  title: 'YES TT Report',
  reportViewTitle: 'YES TT Report',
  loadError: 'Unable to load the YES TT Report.',
  empty: 'Coming soon',
} as const;

export const TT_REPORT_TEXT_BY_LAYOUT = {
  indus: TT_REPORT_TEXT,
  idfc: IDFC_TT_REPORT_TEXT,
  icici: ICICI_TT_REPORT_TEXT,
  yes: YES_TT_REPORT_TEXT,
} as const;
