import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Loader } from '@/components/ui/loader';
import { createEmptyPurchaseFormValues, toFormBranchSnapshot } from '@/modules/purchase/utils/purchaseUtils';
import { TransactionTypeEnum, TradeModeEnum, TransactionTypeProfileEnum } from '@/modules/transactions';
import type { IPurchaseFormValues } from '@/modules/purchase/types/purchaseTypes';
import { useGetFakeCurrency } from '@/modules/fakeCurrencies/hooks';
import { FakeCurrencyCreateView } from '@/modules/fakeCurrencies/views/FakeCurrencyCreateView';

export default function FakeCurrencyEditPage() {
  const { id } = useParams<{ id: string }>();
  const { data: transaction, isLoading, error } = useGetFakeCurrency(id);

  const initialValues = useMemo<IPurchaseFormValues & { reasonId: string; remarks: string } | undefined>(() => {
    if (!transaction) return undefined;
    const values: IPurchaseFormValues & { reasonId: string; remarks: string } = {
      ...createEmptyPurchaseFormValues(
        TransactionTypeEnum.SALE,
        TradeModeEnum.RETAIL,
        TransactionTypeProfileEnum.FAKE_CURRENCY,
        toFormBranchSnapshot(transaction.branchSnapshot),
        transaction.branchId,
        transaction.counterId,
        transaction.transactionDate ? String(transaction.transactionDate).slice(0, 10) : '',
      ),
      reasonId: transaction.reasonId ?? '',
      remarks: transaction.remarks ?? '',
    };
    values.transactions = (transaction.items ?? []).map(item => ({
      currencyId: item.currencyId,
      currencyCode: String(item.currencySnapshot?.code ?? ''),
      currencyName: String(item.currencySnapshot?.name ?? ''),
      productId: item.productId,
      productCode: String(item.productSnapshot?.code ?? ''),
      productDescription: String(item.productSnapshot?.name ?? ''),
      quantity: item.quantity,
      per: item.per ?? '1',
      rate: item.rate,
      commission: item.commission ?? '0',
      commissionSnapshot: item.commissionSnapshot,
      total: '',
      roundOff: item.roundOff ?? '0',
      finalAmount: '',
      cardId: '',
      issuerPartyProfileId: '',
      issuerPartyProfileSnapshot: null,
      cardSnapshot: null,
      isReload: false,
    }));
    return values;
  }, [transaction]);

  if (isLoading) return <div className="flex min-h-[50vh] items-center justify-center"><Loader /></div>;
  if (error || !transaction || !initialValues) return <p className="text-sm text-error-600">Fake-currency transaction not found.</p>;

  return <FakeCurrencyCreateView initialValues={initialValues} savedTransaction={transaction} readOnly />;
}
