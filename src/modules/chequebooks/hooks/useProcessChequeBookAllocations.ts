import { useMutation } from '@tanstack/react-query';
import { chequebookApi, type IChequeBook } from '@/api';
import { formatDateTime } from '@/utils';
import { ChequeBookStatusEnum } from '../types';

export interface IAllocationRow {
  id: string;
  bookId: string;
  requestNo: string;
  requestDate: string;
  bankAccountCode: string;
  bankAccountCodeName?: string;
  bankAccountCodeLabel?: string;
  bookNo: number;
  mvNoFrom: number;
  mvNoTo: number;
  qty: number;
  hoRemarks: string;
  allocatedCashierId: string;
  remarks: string;
  isCheck: boolean;
}

interface IProcessChequeBookAllocationsInput {
  branchId: string;
  bankAccountCode: string;
  fromVal: number;
  toVal: number;
}

const buildAllocationRows = (
  books: IChequeBook[],
  allocations: Array<{
    id?: string;
    checkBookId: string;
    bookNo: number;
    cashierId: string;
    remarks?: string;
  }>,
  fromVal: number,
  toVal: number
) => {
  const generatedRows: IAllocationRow[] = [];

  books.forEach(book => {
    const start = Math.max(book.bookNoFrom, fromVal);
    const end = Math.min(book.bookNoTo, toVal);

    for (let i = start; i <= end; i++) {
      const offset = i - book.bookNoFrom;
      const bookMvNoFrom = book.mvNoFrom + offset * book.vouchersPerBook;
      const bookMvNoTo = bookMvNoFrom + book.vouchersPerBook - 1;

      const existing = allocations.find(
        allocation => allocation.checkBookId === book.id && allocation.bookNo === i
      );

      generatedRows.push({
        id: `${book.id}-${i}`,
        bookId: book.id,
        requestNo: book.no,
        requestDate: formatDateTime(book.dispatchDate) + ' 00:00:00',
        bankAccountCode: book.bankAccountCode,
        bankAccountCodeName: book.bankAccountCodeName,
        bankAccountCodeLabel: book.bankAccountCodeLabel,
        bookNo: i,
        mvNoFrom: bookMvNoFrom,
        mvNoTo: bookMvNoTo,
        qty: book.vouchersPerBook,
        hoRemarks: book.remarks || '-',
        allocatedCashierId: existing ? existing.cashierId : '',
        remarks: existing ? existing.remarks || '' : '',
        isCheck: false,
      });
    }
  });

  return generatedRows;
};

export const useProcessChequeBookAllocations = () => {
  const mutation = useMutation({
    mutationFn: async ({
      branchId,
      bankAccountCode,
      fromVal,
      toVal,
    }: IProcessChequeBookAllocationsInput) => {
      const data = await chequebookApi.findAll(branchId, ChequeBookStatusEnum.APPROVE);

      const matched = data.filter(book => {
        if (bankAccountCode !== 'ALL' && book.bankAccountCode !== bankAccountCode) {
          return false;
        }

        return book.bookNoFrom <= toVal && book.bookNoTo >= fromVal;
      });

      const matchedIds = matched.map(book => book.id);
      const allocations =
        matchedIds.length > 0
          ? await chequebookApi.getAllocations(matchedIds)
          : [];

      return buildAllocationRows(matched, allocations, fromVal, toVal);
    },
  });

  return {
    processAllocations: mutation.mutateAsync,
    isProcessing: mutation.isPending,
  };
};
