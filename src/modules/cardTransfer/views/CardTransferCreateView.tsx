import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import { Form } from '@/components/forms';
import { Loader } from '@/components/ui/loader';
import { useListBranchProfiles } from '@/modules/branchProfile/hooks';
import { useAuth } from '@/lib/AuthContext';
import { getTransactionDatePolicy } from '@/modules/transactionPolicies/utils/transactionDatePolicy';
import toast from 'react-hot-toast';
import { CardTransferForm } from '../forms';
import { cardTransferSchema } from '../schema';
import { emptyTransferForm } from '../utils';
import { useCreateCardTransfer } from '../hooks';
import type { CardTransferFormValues } from '../types';

export const CardTransferCreateView = () => {
  const navigate = useNavigate();
  const { policyContext } = useAuth();
  const { data: branches = [], isLoading: branchesLoading } = useListBranchProfiles({ activeOnly: true });
  const initialValues = useMemo(() => ({ ...emptyTransferForm(), transactionDate: getTransactionDatePolicy(policyContext).defaultTransactionDate }), [policyContext]);
  const createMutation = useCreateCardTransfer();
  const transactionDatePolicy = useMemo(() => getTransactionDatePolicy(policyContext), [policyContext]);
  if (branchesLoading) return <Loader />;
  return <Form<CardTransferFormValues> id="card-transfer-form" defaultValues={initialValues} resolver={yupResolver(cardTransferSchema) as never} mode="onChange" onError={errors => console.error('[CardTransfer] validation failed', errors)} onSubmit={async values => { await createMutation.mutateAsync(values); toast.success('CARD transfer request submitted.'); navigate('/card-transfer'); }} footer={{ submitLabel: 'Submit CARD Transfer Sell', onCancel: () => navigate('/card-transfer'), isSubmitDisabled: !transactionDatePolicy.canPunchTransactions || createMutation.isPending }}><div className="space-y-4"><div><h1 className="text-2xl font-semibold text-text-primary">Create CARD Transfer Sell</h1><p className="text-sm text-text-secondary">Select cards from an HO branch for transfer to another branch. Purchase is created internally when accepted.</p></div><CardTransferForm branches={branches} transactionDatePolicy={transactionDatePolicy} /></div></Form>;
};

export default CardTransferCreateView;
