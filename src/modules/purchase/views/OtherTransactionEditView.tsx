import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader } from '@/components/ui/loader';
import { useAuth } from '@/lib/AuthContext';
import { otherTransactionApi } from '@/api/otherTransaction/otherTransaction.api';
import { TransactionTypeEnum } from '@/modules/transactions';
import { TransactionProfileType } from '../forms/otherTransactionProfileType';
import { OtherTransactionForm } from '../forms/OtherTransactionForm';

const STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Pending Approval',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

const STATUS_CLASS: Record<string, string> = {
  DRAFT: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
};

export const OtherTransactionEditView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalRemarks, setApprovalRemarks] = useState('');

  const { data: transaction, isLoading, error } = useQuery({
    queryKey: ['other-transaction', id],
    queryFn: () => otherTransactionApi.getById(id!),
    enabled: Boolean(id),
  });

  const isReviewer = Boolean(user?.isAdmin || user?.isHo || user?.isHoStaff);
  const canReview = isReviewer && transaction?.status === 'DRAFT';

  const approveMutation = useMutation({
    mutationFn: () =>
      otherTransactionApi.approve(id!, { approvalRemarks: approvalRemarks || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['other-transaction', id] });
      queryClient.invalidateQueries({ queryKey: ['other-transactions'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () =>
      otherTransactionApi.reject(id!, { rejectionReason: rejectionReason || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['other-transaction', id] });
      queryClient.invalidateQueries({ queryKey: ['other-transactions'] });
      setShowRejectInput(false);
    },
  });

  const defaultValues = useMemo(() => {
    if (!transaction) return {};
    return {
      transactionType: transaction.transactionType ?? TransactionTypeEnum.PURCHASE,
      profileType: transaction.profileType ?? TransactionProfileType.AD1,
      branchId: transaction.branchId ?? '',
      counterId: '',
      dealId: transaction.dealId ?? '',
      docNo: transaction.docNo ?? '',
      transactionDate: transaction.transactionDate ? transaction.transactionDate.split('T')[0] : '',
      marketingId: transaction.marketingId ?? '',
      segmentId: transaction.segmentId ?? '',
      servicedBy: transaction.servicedBy ?? '',
      purposeId: transaction.purposeId ?? '',
      remitterName: transaction.remitterName ?? '',
      contactNo: transaction.contactNo ?? '',
      email: transaction.email ?? '',
      address: transaction.address ?? '',
      pan: transaction.pan ?? '',
      dateOfBirth: transaction.dateOfBirth ? transaction.dateOfBirth.split('T')[0] : '',
      productId: transaction.productId ?? '',
      beneficiaryName: transaction.beneficiaryName ?? '',
      beniAddress: transaction.beniAddress ?? '',
      beneAccountNumber: transaction.beneAccountNumber ?? '',
      beneBankName: transaction.beneBankName ?? '',
      swiftCode: transaction.swiftCode ?? '',
      relationshipId: transaction.relationshipId ?? '',
      currencyId: transaction.currencyId ?? '',
      fcVolume: transaction.fcVolume ?? '',
      saleRate: transaction.saleRate ?? '',
      totalInrAmt: transaction.totalInrAmt ?? '',
      gst: transaction.gst ?? '0',
      bankCharges: transaction.bankCharges ?? '0',
      tcs: transaction.tcs ?? '0',
      otherIncome: transaction.otherIncome ?? '0',
      finalAmount: transaction.finalAmount ?? '',
      settlementRate: transaction.settlementRate ?? '',
      grossRevenue: transaction.grossRevenue ?? '',
      revenueReceivable: transaction.revenueReceivable ?? '0',
      agentId: transaction.agentId ?? '',
      commGiven: '',
      commPercentOnFe: '0',
      agentComm: transaction.agentComm ?? '0',
      tds: transaction.tds ?? '0',
      commissionPayable: transaction.commissionPayable ?? '',
      netRevenue: transaction.netRevenue ?? '',
      bankNameId: transaction.bankNameId ?? '',
      rtgsImpsNeftRefNo: transaction.rtgsImpsNeftRefNo ?? '',
      remarks: transaction.remarks ?? '',
    };
  }, [transaction]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="py-8 text-center text-error-600">
        Failed to load transaction. Please try again.
      </div>
    );
  }

  const status = transaction.status ?? 'APPROVED';

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-text-primary">
            Transaction — {transaction.number}
          </h1>
          <p className="text-sm text-text-secondary">
            View or edit this transaction.
          </p>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${STATUS_CLASS[status] ?? 'bg-gray-100 text-gray-700'}`}
        >
          {STATUS_LABEL[status] ?? status}
        </span>
      </div>

      {status === 'REJECTED' && transaction.rejectionReason && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span className="font-medium">Rejected: </span>
          {transaction.rejectionReason}
        </div>
      )}

      {status === 'APPROVED' && transaction.approvalRemarks && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <span className="font-medium">Approval remarks: </span>
          {transaction.approvalRemarks}
        </div>
      )}

      {canReview && (
        <div className="rounded-lg border border-border bg-surface-secondary p-4 space-y-3">
          <p className="text-sm font-medium text-text-primary">Review this transaction</p>

          <div>
            <label className="block text-xs text-text-secondary mb-1">Remarks (optional)</label>
            <input
              type="text"
              value={approvalRemarks}
              onChange={e => setApprovalRemarks(e.target.value)}
              placeholder="Add approval remarks…"
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={approveMutation.isPending}
              onClick={() => approveMutation.mutate()}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {approveMutation.isPending ? 'Approving…' : 'Approve'}
            </button>

            {!showRejectInput ? (
              <button
                type="button"
                onClick={() => setShowRejectInput(true)}
                className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Reject
              </button>
            ) : (
              <div className="flex flex-1 items-center gap-2">
                <input
                  type="text"
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  placeholder="Reason for rejection…"
                  className="flex-1 rounded-md border border-border bg-white px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-red-400"
                />
                <button
                  type="button"
                  disabled={rejectMutation.isPending}
                  onClick={() => rejectMutation.mutate()}
                  className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {rejectMutation.isPending ? 'Rejecting…' : 'Confirm Reject'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowRejectInput(false); setRejectionReason(''); }}
                  className="rounded-md border border-border px-3 py-2 text-sm text-text-secondary hover:bg-surface-secondary"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {(approveMutation.error || rejectMutation.error) && (
            <p className="text-xs text-red-600">
              {(approveMutation.error as Error)?.message || (rejectMutation.error as Error)?.message}
            </p>
          )}
        </div>
      )}

      <OtherTransactionForm
        defaultValues={defaultValues}
        allowWorkplaceSelection={false}
        submitLabel="Save"
        onSubmit={async (values) => {
          await otherTransactionApi.update(transaction.id, {
            transactionType: values.transactionType as string,
            profileType: values.profileType as string,
            dealId: (values.dealId as string) || null,
            docNo: values.docNo as string,
            transactionDate: (values.transactionDate as string) || null,
            marketingId: (values.marketingId as string) || null,
            segmentId: (values.segmentId as string) || null,
            servicedBy: (values.servicedBy as string) || null,
            purposeId: (values.purposeId as string) || null,
            remitterName: (values.remitterName as string) || null,
            contactNo: (values.contactNo as string) || null,
            email: (values.email as string) || null,
            address: (values.address as string) || null,
            pan: (values.pan as string) || null,
            dateOfBirth: (values.dateOfBirth as string) || null,
            productId: (values.productId as string) || null,
            beneficiaryName: (values.beneficiaryName as string) || null,
            beniAddress: (values.beniAddress as string) || null,
            beneAccountNumber: (values.beneAccountNumber as string) || null,
            beneBankName: (values.beneBankName as string) || null,
            swiftCode: (values.swiftCode as string) || null,
            relationshipId: (values.relationshipId as string) || null,
            currencyId: (values.currencyId as string) || null,
            fcVolume: (values.fcVolume as string) || null,
            saleRate: (values.saleRate as string) || null,
            totalInrAmt: (values.totalInrAmt as string) || null,
            gst: (values.gst as string) || null,
            bankCharges: (values.bankCharges as string) || null,
            tcs: (values.tcs as string) || null,
            otherIncome: (values.otherIncome as string) || null,
            finalAmount: (values.finalAmount as string) || null,
            settlementRate: (values.settlementRate as string) || null,
            grossRevenue: (values.grossRevenue as string) || null,
            revenueReceivable: (values.revenueReceivable as string) || null,
            agentId: (values.agentId as string) || null,
            commPercentOnFe: (values.commPercentOnFe as string) || null,
            agentComm: (values.agentComm as string) || null,
            tds: (values.tds as string) || null,
            commissionPayable: (values.commissionPayable as string) || null,
            netRevenue: (values.netRevenue as string) || null,
            bankNameId: (values.bankNameId as string) || null,
            rtgsImpsNeftRefNo: (values.rtgsImpsNeftRefNo as string) || null,
            remarks: (values.remarks as string) || null,
          });
          navigate('/other-transactions');
        }}
        onCancel={() => navigate('/other-transactions')}
      />
    </div>
  );
};

export default OtherTransactionEditView;
