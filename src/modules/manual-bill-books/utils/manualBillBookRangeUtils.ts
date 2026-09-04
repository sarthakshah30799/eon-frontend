import type {
  IManualBookBookTracking,
  IManualBookDispatchMeta,
} from '@/api';

export type ManualBookRangeMeta = Pick<
  IManualBookDispatchMeta,
  'bookNoFrom' | 'mvNoFrom' | 'vouchersPerBook'
>;

export function mvToBookNo(pageNo: number, book: ManualBookRangeMeta): number {
  return (
    book.bookNoFrom +
    Math.floor((pageNo - book.mvNoFrom) / book.vouchersPerBook)
  );
}

export function formatBookRange(from: number, to: number): string {
  return from === to ? String(from) : `${from} – ${to}`;
}

export function toDispatchMeta(
  item: IManualBookBookTracking
): IManualBookDispatchMeta {
  return {
    id: item.manualBookId,
    no: item.no,
    bookNoFrom: item.bookNoFrom,
    bookNoTo: item.bookNoTo,
    vouchersPerBook: item.vouchersPerBook,
    mvNoFrom: item.mvNoFrom,
    mvNoTo: item.mvNoTo,
    branchId: item.branchId,
    transactionType: item.transactionType,
  };
}

export function computeMVRangeForBook(
  bookNo: number,
  book: ManualBookRangeMeta
): { mvFrom: number; mvTo: number } {
  const mvFrom =
    book.mvNoFrom + (bookNo - book.bookNoFrom) * book.vouchersPerBook;
  const mvTo = mvFrom + book.vouchersPerBook - 1;
  return { mvFrom, mvTo };
}
