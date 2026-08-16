import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useFormContext } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Form } from '@/components/forms';
import { useAuth } from '@/lib/AuthContext';
import { transactionPoliciesApi } from '@/api/transactionPolicies';
import { getTransactionDatePolicy } from '@/modules/transactionPolicies/utils/transactionDatePolicy';
import toast from 'react-hot-toast';
import { CardTransferForm } from '../forms';
import { cardTransferSchema } from '../schema';
import { emptyTransferForm } from '../utils';
import { useCreateCardTransfer } from '../hooks';
import type { CardTransferFormValues } from '../types';

const CardTransferTransactionDateSync = ({
  transactionDate,
}: {
  transactionDate: string;
}) => {
  const form = useFormContext<CardTransferFormValues>();

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

export const CardTransferCreateView = () => {
  const navigate = useNavigate();
  const { policyContext, activeBranchId } = useAuth();
  const [sourceBranchId, setSourceBranchId] = useState('');
  const sourceBranchPolicy = useQuery({
    queryKey: ['card-transfer', 'transaction-date-policy', sourceBranchId],
    queryFn: () => transactionPoliciesApi.getPolicyContext(sourceBranchId),
    enabled: Boolean(sourceBranchId),
  });
  const selectedPolicyContext =
    sourceBranchPolicy.data ??
    (sourceBranchId === activeBranchId ? policyContext : null);
  const transactionDatePolicy = useMemo(
    () => getTransactionDatePolicy(selectedPolicyContext),
    [selectedPolicyContext]
  );
  const initialValues = useMemo(() => emptyTransferForm(), []);
  const createMutation = useCreateCardTransfer();
  return (
    <Form<CardTransferFormValues>
      id="card-transfer-form"
      defaultValues={initialValues}
      resolver={yupResolver(cardTransferSchema) as never}
      mode="onChange"
      onError={errors =>
        console.error('[CardTransfer] validation failed', errors)
      }
      onSubmit={async values => {
        await createMutation.mutateAsync(values);
        toast.success('CARD transfer request submitted.');
        navigate('/card-transfer');
      }}
      footer={{
        submitLabel: 'Submit CARD Transfer Sell',
        onCancel: () => navigate('/card-transfer'),
        isSubmitDisabled:
          !sourceBranchId ||
          sourceBranchPolicy.isFetching ||
          !transactionDatePolicy.canPunchTransactions ||
          createMutation.isPending,
      }}
    >
      <CardTransferTransactionDateSync
        transactionDate={transactionDatePolicy.defaultTransactionDate}
      />
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">
            Create CARD Transfer Sell
          </h1>
          <p className="text-sm text-text-secondary">
            Select cards from an HO branch for transfer to another branch.
            Purchase is created internally when accepted.
          </p>
        </div>
        <CardTransferForm
          transactionDatePolicy={transactionDatePolicy}
          onSourceBranchChange={setSourceBranchId}
          isTransactionDateLoading={sourceBranchPolicy.isFetching}
        />
      </div>
    </Form>
  );
};

export default CardTransferCreateView;
