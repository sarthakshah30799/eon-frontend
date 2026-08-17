import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useFormContext } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Form } from '@/components/forms';
import { Loader } from '@/components/ui/loader';
import { useAuth } from '@/lib/AuthContext';
import { transactionPoliciesApi } from '@/api/transactionPolicies';
import { getTransactionDatePolicy } from '@/modules/transactionPolicies/utils/transactionDatePolicy';
import { useListBranchProfiles } from '@/modules/branchProfile/hooks';
import { CardStockSettlementDocumentKind } from '@/api/cardSettlement';
import toast from 'react-hot-toast';
import { CardSettlementForm } from '../forms';
import { cardSettlementSchema } from '../schema/cardSettlementSchema';
import { CARD_SETTLEMENT_TEXT } from '../constants/cardSettlementConstants';
import { useCreateCardSettlement } from '../hooks';
import type { CardSettlementFormValues } from '../types/cardSettlementTypes';
import { emptySettlementForm } from '../utils/cardSettlementUtils';

const SettlementDateSync = ({ transactionDate }: { transactionDate: string }) => {
  const form = useFormContext<CardSettlementFormValues>();
  useEffect(() => {
    if (!transactionDate || form.getValues('transactionDate') === transactionDate) return;
    form.setValue('transactionDate', transactionDate, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: true,
    });
  }, [form, transactionDate]);
  return null;
};

const SettlementKindSync = ({
  kind,
  hoBranchId,
}: {
  kind: CardStockSettlementDocumentKind;
  hoBranchId: string;
}) => {
  const form = useFormContext<CardSettlementFormValues>();
  useEffect(() => {
    if (form.getValues('kind') === kind) return;
    form.setValue('kind', kind);
    form.setValue('items', [], { shouldDirty: false, shouldValidate: true });
  }, [form, kind]);
  useEffect(() => {
    if (!hoBranchId || form.getValues('hoBranchId')) return;
    form.setValue('hoBranchId', hoBranchId, { shouldValidate: true });
  }, [form, hoBranchId]);
  return null;
};

export const CardSettlementCreateView = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, policyContext, activeBranchId } = useAuth();
  const isHo = Boolean(user?.isAdmin || user?.isHo || user?.isHoStaff);
  const kind = isHo
    ? CardStockSettlementDocumentKind.HO_ISSUER
    : CardStockSettlementDocumentKind.BRANCH_HO;
  const branchesQuery = useListBranchProfiles({ activeOnly: true }, isHo);
  const defaultHoBranchId = useMemo(() => {
    const hoBranches = (branchesQuery.data ?? []).filter(branch => branch.isHeadOffice);
    return hoBranches.find(branch => branch.id === activeBranchId)?.id ?? hoBranches[0]?.id ?? '';
  }, [activeBranchId, branchesQuery.data]);
  const [hoBranchId, setHoBranchId] = useState('');
  const selectedHoBranchId = hoBranchId || defaultHoBranchId;
  const policyBranchId = isHo ? selectedHoBranchId : activeBranchId;
  const policyQuery = useQuery({
    queryKey: ['card-settlement', 'transaction-date-policy', policyBranchId],
    queryFn: () => transactionPoliciesApi.getPolicyContext(policyBranchId ?? ''),
    enabled: Boolean(policyBranchId),
  });
  const transactionDatePolicy = useMemo(
    () => getTransactionDatePolicy(policyQuery.data ?? (policyBranchId === activeBranchId ? policyContext : null)),
    [activeBranchId, policyBranchId, policyContext, policyQuery.data]
  );
  const createMutation = useCreateCardSettlement();
  const initialValues = useMemo(() => {
    const values = emptySettlementForm(kind);
    values.hoBranchId = isHo ? defaultHoBranchId : '';
    values.transactionDate = transactionDatePolicy.defaultTransactionDate ?? '';
    return values;
  }, [defaultHoBranchId, isHo, kind, transactionDatePolicy.defaultTransactionDate]);

  if (authLoading || !user || (isHo && branchesQuery.isLoading)) {
    return <Loader />;
  }

  return (
    <Form<CardSettlementFormValues>
      id="card-settlement-create-form"
      key={`${kind}-${defaultHoBranchId}`}
      defaultValues={initialValues}
      resolver={yupResolver(cardSettlementSchema) as never}
      mode="onChange"
      onSubmit={async values => {
        await createMutation.mutateAsync({
          kind,
          issuerPartyProfileId: values.issuerPartyProfileId,
          currencyId: values.currencyId,
          hoBranchId: isHo ? values.hoBranchId || undefined : undefined,
          transactionDate: values.transactionDate,
          reference: values.reference || undefined,
          remarks: values.remarks || undefined,
          items: values.items.map(item => ({ id: item.id, rate: item.rate })),
        });
        toast.success(CARD_SETTLEMENT_TEXT.created);
        navigate('/card-settlement');
      }}
      footer={{
        submitLabel: CARD_SETTLEMENT_TEXT.submit,
        onCancel: () => navigate('/card-settlement'),
        isSubmitDisabled:
          createMutation.isPending ||
          policyQuery.isFetching ||
          transactionDatePolicy.canPunchTransactions === false,
      }}
    >
      <SettlementKindSync kind={kind} hoBranchId={defaultHoBranchId} />
      <SettlementDateSync transactionDate={transactionDatePolicy.defaultTransactionDate} />
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">
            {CARD_SETTLEMENT_TEXT.createTitle}
          </h1>
          <p className="text-sm text-text-secondary">
            {CARD_SETTLEMENT_TEXT.createDescription}
          </p>
        </div>
        <CardSettlementForm
          isHo={isHo}
          transactionDatePolicy={transactionDatePolicy}
          isTransactionDateLoading={policyQuery.isFetching}
          onHoBranchChange={setHoBranchId}
        />
      </div>
    </Form>
  );
};

export default CardSettlementCreateView;
