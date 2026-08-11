import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import { Form } from '@/components/forms';
import { Loader } from '@/components/ui/loader';
import { useListBranchProfiles } from '@/modules/branchProfile/hooks';
import { useListCounterProfiles } from '@/modules/counterProfile/hooks';
import { CardTransferForm } from '../forms';
import { cardTransferSchema } from '../schema';
import { emptyTransferForm } from '../utils';
import type { CardTransferFormValues } from '../types';
import { createCardTransfer } from '../hooks';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/AuthContext';
import { getTransactionDatePolicy } from '@/modules/transactionPolicies/utils/transactionDatePolicy';

export const CardTransferCreateView = () => {
  const navigate = useNavigate();
  const { policyContext } = useAuth();
  const { data: branches = [], isLoading: branchesLoading } = useListBranchProfiles({ activeOnly: true });
  const { data: counters = [], isLoading: countersLoading } = useListCounterProfiles({ activeOnly: true });
  const transactionDatePolicy = useMemo(() => getTransactionDatePolicy(policyContext), [policyContext]);
  const initialValues = useMemo(() => ({ ...emptyTransferForm(), transactionDate: transactionDatePolicy.defaultTransactionDate }), [transactionDatePolicy.defaultTransactionDate]);
  if (branchesLoading || countersLoading) return <Loader />;
  return <Form<CardTransferFormValues> id="card-transfer-form" defaultValues={initialValues} resolver={yupResolver(cardTransferSchema) as never} mode="onChange" onError={errors => console.error('[CardTransfer] validation failed', errors)} onSubmit={values => { createCardTransfer(values); toast.success('CARD transfer request submitted and held for approval.'); navigate('/card-transfer'); }} footer={{ submitLabel: 'Submit CARD Transfer', onCancel: () => navigate('/card-transfer'), isSubmitDisabled: !transactionDatePolicy.canPunchTransactions }}><div className="space-y-4"><div><h1 className="text-2xl font-semibold text-text-primary">Create CARD Transfer</h1><p className="text-sm text-text-secondary">Select cards from HO stock for transfer to the destination branch.</p>{transactionDatePolicy.helperText ? <p className="text-xs text-text-secondary">{transactionDatePolicy.helperText}</p> : null}</div><CardTransferForm branches={branches} counters={counters} transactionDatePolicy={transactionDatePolicy} /></div></Form>;
};

export default CardTransferCreateView;
