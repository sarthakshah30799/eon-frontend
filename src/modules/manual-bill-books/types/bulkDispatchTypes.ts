export interface IBulkDispatchFormValues {
  dispatchDate: string;
  no?: string;
  branchId: string;
  transactionType: string;
  bookNoFrom: string | number;
  bookNoTo: string | number;
  vouchersPerBook: string | number;
  mvNoFrom: string | number;
  mvNoTo: string;
  assignedTo: string;
  remarks: string;
}
