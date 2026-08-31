import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { cardStockApi, type ICardStockReceipt } from '@/api/cardStock';
import {
  toPrintBranch,
  toPrintCompany,
  snapshotAddress,
} from '@/modules/transactions/utils/printSnapshotUtils';
import { CARD_STOCK_PRINT_TEXT } from '../constants/cardStockConstants';
import {
  buildCardStockPrintHtml,
  buildReceiptPrintLines,
  getCardStockPrintCopyLabel,
  getCardStockPrintCopyType,
  openCardStockPrintWindow,
} from '../utils/cardStockPrintUtils';

export const useRecordCardStockReceiptPrint = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Parameters<typeof cardStockApi.recordPrint>[1];
    }) => cardStockApi.recordPrint(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.setQueryData<ICardStockReceipt>(
        ['card-stock', 'receipts', variables.id],
        current =>
          current
            ? { ...current, printCount: (current.printCount ?? 0) + 1 }
            : current
      );
      void queryClient.invalidateQueries({
        queryKey: ['card-stock', 'receipts', variables.id],
      });
      void queryClient.invalidateQueries({
        queryKey: ['card-stock', 'receipts'],
      });
    },
  });
};

export const usePrintCardStockReceipt = () => {
  const recordPrint = useRecordCardStockReceiptPrint();
  const [isPrinting, setIsPrinting] = useState(false);

  const printReceipt = async (receipt: ICardStockReceipt) => {
    if (isPrinting) return;
    setIsPrinting(true);
    try {
      const copyType = getCardStockPrintCopyType(receipt.printCount);
      const html = buildCardStockPrintHtml({
        kind: 'STOCK_IN',
        copyType,
        documentNumber: receipt.transactionNumber,
        documentDate: receipt.receiptDate,
        company: toPrintCompany(receipt.companySnapshot),
        branch: toPrintBranch(receipt.branchSnapshot),
        counterpartName: receipt.issuerPartyProfileSnapshot?.name || '-',
        counterpartAddress: snapshotAddress(receipt.issuerPartyProfileSnapshot),
        lines: buildReceiptPrintLines(receipt),
      });
      await recordPrint.mutateAsync({
        id: receipt.id,
        payload: { copyType, kind: 'STOCK_IN', html },
      });
      openCardStockPrintWindow(html);
      toast.success(
        CARD_STOCK_PRINT_TEXT.printed(getCardStockPrintCopyLabel(copyType))
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : CARD_STOCK_PRINT_TEXT.printFailed
      );
    } finally {
      setIsPrinting(false);
    }
  };

  return { printReceipt, isPrinting };
};
