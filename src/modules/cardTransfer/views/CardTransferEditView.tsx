import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, FormFieldTextarea } from '@/components/forms';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Modal } from '@/components/ui';
import { Loader } from '@/components/ui/loader';
import { useListBranchProfiles } from '@/modules/branchProfile/hooks';
import { useListCounterProfiles } from '@/modules/counterProfile/hooks';
import toast from 'react-hot-toast';
import { CardTransferForm } from '../forms';
import { cardTransferSchema } from '../schema';
import { deleteCardTransfer, getCardTransfer, updateCardTransfer, updateCardTransferStatus } from '../hooks';
import type { CardTransferFormValues } from '../types';
import { useAuth } from '@/lib/AuthContext';
import { getTransactionDatePolicy } from '@/modules/transactionPolicies/utils/transactionDatePolicy';

export const CardTransferEditView = () => {
  const navigate = useNavigate();
  const { id = '' } = useParams();
  const { policyContext } = useAuth();
  const request = getCardTransfer(id);
  const { data: branches = [], isLoading: branchesLoading } = useListBranchProfiles({ activeOnly: true });
  const { data: counters = [], isLoading: countersLoading } = useListCounterProfiles({ activeOnly: true });
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const readOnly = request?.status !== 'HELD';
  const initialValues = useMemo(() => request ? { ...request } : undefined, [request]);
  const transactionDatePolicy = useMemo(() => getTransactionDatePolicy(policyContext), [policyContext]);

  if (branchesLoading || countersLoading) return <Loader />;
  if (!request || !initialValues) return <div className="rounded border border-red-300 bg-red-50 p-4 text-sm text-red-700">CARD transfer request not found.</div>;

  const save = (values: CardTransferFormValues) => { updateCardTransfer(id, values); toast.success('CARD transfer request updated.'); navigate('/card-transfer'); };
  const changeStatus = (status: 'ACCEPTED' | 'CANCELLED') => { updateCardTransferStatus(id, status); toast.success(`CARD transfer ${status.toLowerCase()}.`); navigate('/card-transfer'); };
  const reject = () => { if (!rejectReason.trim()) { toast.error('Rejection reason is required.'); return; } updateCardTransferStatus(id, 'REJECTED', rejectReason.trim()); toast.success('CARD transfer rejected.'); navigate('/card-transfer'); };
  const remove = () => { deleteCardTransfer(id); toast.success('Held CARD transfer deleted.'); navigate('/card-transfer'); };

  return <Form<CardTransferFormValues> id="card-transfer-edit-form" defaultValues={initialValues} resolver={yupResolver(cardTransferSchema) as never} mode="onChange" onSubmit={save} footer={{ showSubmit: !readOnly, submitLabel: 'Save CARD Transfer', onCancel: () => navigate('/card-transfer'), actions: <div className="flex flex-wrap gap-2">{request.status === 'HELD' ? <><Button type="button" variant="outline" onClick={() => setRejectOpen(true)}>Reject</Button><Button type="button" variant="outline" onClick={() => changeStatus('CANCELLED')}>Cancel Request</Button><Button type="button" variant="outline" onClick={remove}>Delete</Button></> : null}{request.status === 'HELD' ? <Button type="button" onClick={() => changeStatus('ACCEPTED')}>Accept</Button> : null}</div> }}>
    <div className="space-y-4"><div><h1 className="text-2xl font-semibold text-text-primary">{readOnly ? 'CARD Transfer Request' : 'Edit CARD Transfer'}</h1><p className="text-sm text-text-secondary">{readOnly ? `This request is ${request.status.toLowerCase()} and is read-only.` : 'Held requests can be edited, deleted, accepted, rejected, or cancelled.'}</p></div><CardTransferForm branches={branches} counters={counters} readOnly={readOnly} transactionDatePolicy={transactionDatePolicy} /></div>
    <Modal open={rejectOpen} onOpenChange={setRejectOpen} title="Reject CARD Transfer" description="Enter the reason for rejecting this request." footer={<div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setRejectOpen(false)}>Close</Button><Button type="button" onClick={reject}>Confirm Reject</Button></div>}><FormFieldTextarea name="rejectionReason" label="Reason" value={rejectReason} onChange={event => setRejectReason(event.target.value)} placeholder="Rejection reason" rows={4} /></Modal>
  </Form>;
};

export default CardTransferEditView;
