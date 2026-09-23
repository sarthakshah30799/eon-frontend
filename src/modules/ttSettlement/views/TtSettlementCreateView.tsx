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
import { branchProfileApi } from '@/api/branchProfile';
import { TtSettlementDocumentKind } from '@/api/ttSettlement';
import toast from 'react-hot-toast';
import { TtSettlementForm } from '../forms';
import { ttSettlementSchema } from '../schema/ttSettlementSchema';
import { TT_SETTLEMENT_TEXT } from '../constants/ttSettlementConstants';
import { useCreateTtSettlement } from '../hooks';
import type { TtSettlementFormValues } from '../types/ttSettlementTypes';
import { emptySettlementForm } from '../utils/ttSettlementUtils';

const SettlementDateSync = ({
  transactionDate,
}: {
  transactionDate: string;
}) => {
  const form = useFormContext<TtSettlementFormValues>();
  useEffect(() => {
    if (
      !transactionDate ||
      form.getValues('transactionDate') === transactionDate
    )
      return;
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
  kind: TtSettlementDocumentKind;
  hoBranchId: string;
}) => {
  const form = useFormContext<TtSettlementFormValues>();
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

export const TtSettlementCreateView = () => {
  const navigate = useNavigate();
  const {
    user,
    isLoading: authLoading,
    policyContext,
    activeBranchId,
  } = useAuth();
  const isHo = Boolean(user?.isAdmin || user?.isHo || user?.isHoStaff);
  const kind = isHo
    ? TtSettlementDocumentKind.HO_ISSUER
    : TtSettlementDocumentKind.BRANCH_HO;
  const branchesQuery = useQuery({
    queryKey: ['branch-profiles-all', { activeOnly: true }],
    queryFn: () => branchProfileApi.getAllBranchProfiles({ activeOnly: true }),
    enabled: isHo,
  });
  const defaultHoBranchId = useMemo(() => {
    const hoBranches = (branchesQuery.data ?? []).filter(
      branch => branch.isHeadOffice
    );
    return (
      hoBranches.find(branch => branch.id === activeBranchId)?.id ??
      hoBranches[0]?.id ??
      ''
    );
  }, [activeBranchId, branchesQuery.data]);
  const [hoBranchId, setHoBranchId] = useState('');
  const selectedHoBranchId = hoBranchId || defaultHoBranchId;
  const policyBranchId = isHo ? selectedHoBranchId : activeBranchId;
  const policyQuery = useQuery({
    queryKey: ['tt-settlement', 'transaction-date-policy', policyBranchId],
    queryFn: () =>
      transactionPoliciesApi.getPolicyContext(policyBranchId ?? ''),
    enabled: Boolean(policyBranchId),
  });
  const transactionDatePolicy = useMemo(
    () =>
      getTransactionDatePolicy(
        policyQuery.data ??
          (policyBranchId === activeBranchId ? policyContext : null)
      ),
    [activeBranchId, policyBranchId, policyContext, policyQuery.data]
  );
  const createMutation = useCreateTtSettlement();
  const initialValues = useMemo(() => {
    const values = emptySettlementForm(kind);
    values.hoBranchId = isHo ? defaultHoBranchId : '';
    values.transactionDate = transactionDatePolicy.defaultTransactionDate ?? '';
    return values;
  }, [
    defaultHoBranchId,
    isHo,
    kind,
    transactionDatePolicy.defaultTransactionDate,
  ]);

  if (authLoading || !user || (isHo && branchesQuery.isLoading)) {
    return <Loader />;
  }

  return (
    <Form<TtSettlementFormValues>
      id="tt-settlement-create-form"
      key={`${kind}-${defaultHoBranchId}`}
      defaultValues={initialValues}
      resolver={yupResolver(ttSettlementSchema) as never}
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
        toast.success(TT_SETTLEMENT_TEXT.created);
        navigate('/tt-settlement');
      }}
      footer={{
        submitLabel: TT_SETTLEMENT_TEXT.submit,
        onCancel: () => navigate('/tt-settlement'),
        isSubmitDisabled:
          createMutation.isPending ||
          policyQuery.isFetching ||
          transactionDatePolicy.canPunchTransactions === false,
      }}
    >
      <SettlementKindSync kind={kind} hoBranchId={defaultHoBranchId} />
      <SettlementDateSync
        transactionDate={transactionDatePolicy.defaultTransactionDate}
      />
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">
            {TT_SETTLEMENT_TEXT.createTitle}
          </h1>
          <p className="text-sm text-text-secondary">
            {TT_SETTLEMENT_TEXT.createDescription}
          </p>
        </div>
        <TtSettlementForm
          isHo={isHo}
          transactionDatePolicy={transactionDatePolicy}
          isTransactionDateLoading={policyQuery.isFetching}
          onHoBranchChange={setHoBranchId}
        />
      </div>
    </Form>
  );
};

export default TtSettlementCreateView;
