import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import type { CardStockPrintKind } from '@/api/cardStock';
import { cardTransferApi } from '@/api/cardTransfer';
import { CARD_STOCK_PRINT_TEXT } from '@/modules/cardStock/constants/cardStockConstants';
import {
  buildCardStockPrintHtml,
  buildTransferPrintLines,
  getCardStockPrintCopyLabel,
  getCardStockPrintCopyType,
  openCardStockPrintWindow,
} from '@/modules/cardStock/utils/cardStockPrintUtils';
import {
  snapshotAddress,
  toPrintBranch,
  toPrintCompany,
} from '@/modules/transactions/utils/printSnapshotUtils';
import { cardTransferQueryKeys } from './useCardTransfers';
import type { CardTransferRequest } from '../types';

export const useRecordCardTransferPrint = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Parameters<typeof cardTransferApi.recordPrint>[1];
    }) => cardTransferApi.recordPrint(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.setQueryData<CardTransferRequest>(cardTransferQueryKeys.detail(variables.id), current => {
        if (!current) return current;
        if (variables.payload.kind === 'STOCK_OUT') {
          return { ...current, sourcePrintCount: (current.sourcePrintCount ?? 0) + 1 };
        }
        return { ...current, destinationPrintCount: (current.destinationPrintCount ?? 0) + 1 };
      });
      void queryClient.invalidateQueries({ queryKey: cardTransferQueryKeys.detail(variables.id) });
      void queryClient.invalidateQueries({ queryKey: cardTransferQueryKeys.all });
    },
  });
};

export const usePrintCardTransferStock = () => {
  const recordPrint = useRecordCardTransferPrint();
  const [isPrinting, setIsPrinting] = useState(false);

  const printTransfer = async (request: CardTransferRequest, kind: CardStockPrintKind) => {
    if (isPrinting) return;
    setIsPrinting(true);
    try {
      const printCount =
        kind === 'STOCK_OUT' ? request.sourcePrintCount : request.destinationPrintCount;
      const copyType = getCardStockPrintCopyType(printCount);
      const printingSnapshot =
        kind === 'STOCK_OUT' ? request.sourceBranchSnapshot : request.destinationBranchSnapshot;
      const counterpartSnapshot =
        kind === 'STOCK_OUT' ? request.destinationBranchSnapshot : request.sourceBranchSnapshot;
      const counterpartName = counterpartSnapshot?.name?.trim() || '-';
      const html = buildCardStockPrintHtml({
        kind,
        copyType,
        documentNumber: request.transactionNumber,
        documentDate: request.transactionDate,
        company: toPrintCompany(request.companySnapshot),
        branch: toPrintBranch(printingSnapshot),
        counterpartName,
        counterpartAddress: snapshotAddress(counterpartSnapshot),
        lines: buildTransferPrintLines(request),
      });
      await recordPrint.mutateAsync({
        id: request.id,
        payload: { copyType, kind, html },
      });
      openCardStockPrintWindow(html);
      toast.success(CARD_STOCK_PRINT_TEXT.printed(getCardStockPrintCopyLabel(copyType)));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : CARD_STOCK_PRINT_TEXT.printFailed);
    } finally {
      setIsPrinting(false);
    }
  };

  return { printTransfer, isPrinting };
};
