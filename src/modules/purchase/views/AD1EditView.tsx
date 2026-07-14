import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader } from '@/components/ui/loader';
import { useAuth } from '@/lib/AuthContext';
import { transactionAd1Api } from '@/api/transactionAd1/transactionAd1.api';
import { TransactionTypeEnum } from '@/modules/transactions';
import { TransactionProfileType } from '../forms/AD1Form';
import { AD1Form } from '../forms/AD1Form';

export const AD1EditView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: transaction, isLoading, error } = useQuery({
    queryKey: ['ad1', id],
    queryFn: () => transactionAd1Api.getById(id!),
    enabled: Boolean(id),
  });

  const defaultValues = useMemo(() => {
    if (!transaction) return {};
    return {
      transactionType: transaction.transactionType ?? TransactionTypeEnum.PURCHASE,
      profileType: transaction.profileType ?? TransactionProfileType.AD1,
      branchId: transaction.branchId ?? '',
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
      fxRefAgentId: transaction.fxRefAgentId ?? '',
      commGivenId: transaction.commGivenId ?? '',
      commPercentOnFe: transaction.commPercentOnFe ?? '0',
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
        Failed to load AD1 transaction. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-text-primary">
          AD1 Transaction — {transaction.number}
        </h1>
        <p className="text-sm text-text-secondary">
          View or edit this AD1 transaction.
        </p>
      </div>

      <AD1Form
        defaultValues={defaultValues}
        user={user}
        onSubmit={async (values) => {
            await transactionAd1Api.update(transaction.id, {
              branchId: values.branchId,
              transactionType: values.transactionType,
              profileType: values.profileType,
              dealId: values.dealId || null,
              docNo: values.docNo,
              transactionDate: values.transactionDate || null,
              marketingId: values.marketingId || null,
              segmentId: values.segmentId || null,
              servicedBy: values.servicedBy || null,
              purposeId: values.purposeId || null,
              remitterName: values.remitterName || null,
              contactNo: values.contactNo || null,
              email: values.email || null,
              address: values.address || null,
              pan: values.pan || null,
              dateOfBirth: values.dateOfBirth || null,
              productId: values.productId || null,
              beneficiaryName: values.beneficiaryName || null,
              beniAddress: values.beniAddress || null,
              beneAccountNumber: values.beneAccountNumber || null,
              beneBankName: values.beneBankName || null,
              swiftCode: values.swiftCode || null,
              relationshipId: values.relationshipId || null,
              currencyId: values.currencyId || null,
              fcVolume: values.fcVolume || null,
              saleRate: values.saleRate || null,
              totalInrAmt: values.totalInrAmt || null,
              gst: values.gst || null,
              bankCharges: values.bankCharges || null,
              tcs: values.tcs || null,
              otherIncome: values.otherIncome || null,
              finalAmount: values.finalAmount || null,
              settlementRate: values.settlementRate || null,
              grossRevenue: values.grossRevenue || null,
              revenueReceivable: values.revenueReceivable || null,
              fxRefAgentId: values.fxRefAgentId || null,
              commGivenId: values.commGivenId || null,
              commPercentOnFe: values.commPercentOnFe || null,
              agentComm: values.agentComm || null,
              tds: values.tds || null,
              commissionPayable: values.commissionPayable || null,
              netRevenue: values.netRevenue || null,
              bankNameId: values.bankNameId || null,
              rtgsImpsNeftRefNo: values.rtgsImpsNeftRefNo || null,
              remarks: values.remarks || null,
            });
            navigate('/ad1');
        }}
        onCancel={() => navigate('/ad1')}
      />
    </div>
  );
};

export default AD1EditView;
