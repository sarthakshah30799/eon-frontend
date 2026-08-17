export const COMMON_TEXTS = {
  // Loading States
  LOADING: 'Loading...',

  // Error States
  ERROR: 'Error',

  // General
  SUBMIT: 'Submit',
  CANCEL: 'Cancel',
  CLOSE: 'Close',
} as const;

export const PAGE_STATUS_TEXTS = {
  NOT_FOUND_TITLE: 'Page not found',
  NOT_FOUND_MESSAGE: 'The page you are looking for is not available.',
  ACCESS_DENIED_TITLE: 'Access denied',
  ACCESS_DENIED_MESSAGE: 'You do not have permission to view this page.',
  ACCESS_DENIED_COUNTER_MESSAGE:
    'You do not have permission to view this page for the selected counter.',
  GO_HOME: 'Go Home',
} as const;
