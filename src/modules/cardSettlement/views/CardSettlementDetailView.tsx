import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CardStockSettlementStatus, type CardStockSettlement } from '@/api/cardSettlement';
import { Button, CardSection, Modal } from '@/components/ui';
import { Loader } from '@/components/ui/loader';
import { Form, FormFieldTextarea } from '@/components/forms';
import { useAuth } from '@/lib/AuthContext';
import { formatDateTime } from '@/utils';
import { CardBranchSettlementModal, CardSettlementBulkModal } from '../components';
import { useAcceptBranchSettlements, useBulkSettleCards, useCancelCardSettlement, useCardSettlement, useRejectBranchSettlements, useSubmitBranchSettlements } from '../hooks';
import { CARD_SETTLEMENT_TEXT } from '../constants/cardSettlementConstants';

const display = (snapshot: CardStockSettlement['currencySnapshot'], fallback: string) => snapshot?.label ?? snapshot?.currencyCode ?? snapshot?.name ?? snapshot?.code ?? fallback;
const Field = ({ label, value }: { label: string; value?: string | null }) => <div><div className="text-xs font-medium uppercase tracking-wide text-text-tertiary">{label}</div><div className="mt-1 min-h-6 text-sm text-text-primary">{value || '-'}</div></div>;

export const CardSettlementDetailView = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isHo = Boolean(user?.isAdmin || user?.isHo || user?.isHoStaff);
  const query = useCardSettlement(id);
  const settle = useBulkSettleCards();
  const submitBranch = useSubmitBranchSettlements();
  const acceptBranch = useAcceptBranchSettlements();
  const rejectBranch = useRejectBranchSettlements();
  const cancel = useCancelCardSettlement();
  const [settleOpen, setSettleOpen] = useState(false);
  const [branchOpen, setBranchOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  if (query.isLoading) return <Loader />;
  if (query.error || !query.data) return <div className="py-8 text-center text-error-600">{query.error instanceof Error ? query.error.message : 'CARD settlement not found'}</div>;
  const item = query.data;
  const pendingBranch = item.status === CardStockSettlementStatus.PENDING_BRANCH_SETTLEMENT;
  const pendingHo = item.status === CardStockSettlementStatus.PENDING_HO_ACCEPTANCE;
  const pendingIssuer = item.status === CardStockSettlementStatus.PENDING_ISSUER_SETTLEMENT;
  const canCancel = pendingBranch || pendingHo || (isHo && pendingIssuer);
  return <div className="space-y-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-2xl font-semibold text-text-primary">{CARD_SETTLEMENT_TEXT.detailTitle}</h1><p className="text-sm text-text-secondary">Series {item.series} · {item.maskedCardNumber}</p></div><div className="flex flex-wrap gap-2">{canCancel && <Button type="button" variant="outline" onClick={() => setCancelOpen(true)}>Cancel Settlement</Button>}{pendingBranch && <Button type="button" onClick={() => setBranchOpen(true)}>{item.branchId === item.hoBranchId ? 'Settle Branch Item' : 'Submit to HO'}</Button>}{isHo && pendingHo && <><Button type="button" variant="outline" onClick={() => setRejectOpen(true)}>Reject</Button><Button type="button" onClick={async () => { try { await acceptBranch.mutateAsync([item.id]); toast.success('Branch settlement accepted'); await query.refetch(); } catch (error) { toast.error(error instanceof Error ? error.message : 'Acceptance failed'); } }}>Accept</Button></>}{isHo && pendingIssuer && <Button type="button" onClick={() => setSettleOpen(true)}>Settle with Issuer</Button>}<Button type="button" variant="outline" onClick={() => navigate('/card-settlement')}>Back</Button></div></div>
    <CardSection heading="Card and Sale"><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"><Field label="Masked Card Number" value={item.maskedCardNumber} /><Field label="Kit Number" value={item.kitNumber} /><Field label="Series" value={item.series} /><Field label="Status" value={item.status.replaceAll('_', ' ')} /><Field label="Currency" value={display(item.currencySnapshot, item.currencyId)} /><Field label="Product" value={display(item.productSnapshot, item.productId)} /><Field label="Issuer" value={display(item.issuerPartyProfileSnapshot, item.issuerPartyProfileId)} /><Field label="Selling Branch" value={display(item.branchSnapshot, item.branchId)} /><Field label="HO Branch" value={display(item.hoBranchSnapshot, item.hoBranchId)} /><Field label="Denomination" value={item.denomination} /><Field label="Fixed Buy Rate" value={item.buyRate} /><Field label="Settlement Amount" value={item.settlementAmount} /><Field label="Sale Date" value={formatDateTime(item.saleDate, 'DD/MM/YYYY')} /><Field label="Branch Settlement Date" value={formatDateTime(item.branchSettlementDate)} /><Field label="Branch Settlement Entry" value={item.branchSettlementEntryId} /><Field label="Sale Transaction" value={item.transactionId} /></div></CardSection>
    <CardSection heading="Branch Settlement"><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"><Field label="Mode" value={item.settlementMode} /><Field label="Requested Date" value={item.branchRequestedDate ? formatDateTime(item.branchRequestedDate, 'DD/MM/YYYY') : null} /><Field label="Reference" value={item.branchReference} /><Field label="Remarks" value={item.branchRemarks} /><Field label="HO Accepted At" value={formatDateTime(item.hoAcceptedAt)} /><Field label="HO Rejected At" value={formatDateTime(item.hoRejectedAt)} /><Field label="HO Rejection Reason" value={item.hoRejectionReason} /></div></CardSection>
    <CardSection heading="Issuer Settlement"><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"><Field label="Issuer Settlement Date" value={item.issuerSettlementDate ? formatDateTime(item.issuerSettlementDate, 'DD/MM/YYYY') : null} /><Field label="Issuer Reference" value={item.issuerReference} /><Field label="Issuer Remarks" value={item.issuerRemarks} /><Field label="Issuer Settlement Entry" value={item.issuerSettlementEntryId} /><Field label="Cancellation Reason" value={item.cancellationReason} /></div></CardSection>
    <CardBranchSettlementModal open={branchOpen} items={[item]} submitting={submitBranch.isPending} onClose={() => setBranchOpen(false)} onSubmit={async payload => { try { await submitBranch.mutateAsync(payload); toast.success(item.branchId === item.hoBranchId ? 'Branch settlement completed' : 'Branch settlement submitted'); setBranchOpen(false); await query.refetch(); } catch (error) { toast.error(error instanceof Error ? error.message : 'Branch settlement failed'); } }} />
    <CardSettlementBulkModal open={settleOpen} items={[item]} submitting={settle.isPending} onClose={() => setSettleOpen(false)} onSubmit={async payload => { try { await settle.mutateAsync(payload); toast.success('CARD issuer settlement completed'); setSettleOpen(false); await query.refetch(); } catch (error) { toast.error(error instanceof Error ? error.message : 'Settlement failed'); } }} />
    <Modal open={rejectOpen} onOpenChange={setRejectOpen} title="Reject Branch Settlement" description="The item will return to the selling branch as unsettled."><Form<{ reason: string }> defaultValues={{ reason: '' }} onSubmit={async values => { if (!values.reason.trim()) { toast.error('Rejection reason is required'); return; } try { await rejectBranch.mutateAsync({ ids: [item.id], reason: values.reason }); toast.success('Branch settlement rejected'); setRejectOpen(false); await query.refetch(); } catch (error) { toast.error(error instanceof Error ? error.message : 'Rejection failed'); } }}><FormFieldTextarea name="reason" label="Rejection Reason" rows={4} /><div className="mt-4 flex justify-end"><Button type="submit" disabled={rejectBranch.isPending}>Reject</Button></div></Form></Modal>
    <Modal open={cancelOpen} onOpenChange={setCancelOpen} title="Cancel CARD Settlement" description="Cancellation stops this pending settlement workflow."><Form<{ reason: string }> defaultValues={{ reason: '' }} onSubmit={async values => { if (!values.reason.trim()) { toast.error('Cancellation reason is required'); return; } try { await cancel.mutateAsync({ id: item.id, reason: values.reason }); toast.success('CARD settlement cancelled'); setCancelOpen(false); await query.refetch(); } catch (error) { toast.error(error instanceof Error ? error.message : 'Cancellation failed'); } }}><FormFieldTextarea name="reason" label="Cancellation Reason" rows={4} /><div className="mt-4 flex justify-end"><Button type="submit" disabled={cancel.isPending}>{cancel.isPending ? 'Cancelling...' : 'Confirm Cancellation'}</Button></div></Form></Modal>
  </div>;
};

export default CardSettlementDetailView;
