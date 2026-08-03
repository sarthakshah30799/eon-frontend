export const getTransferHookErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

