import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { transactionAd1Api } from '@/api/transactionAd1/transactionAd1.api';
import { TransactionTypeEnum } from '@/modules/transactions';
import { TransactionProfileType } from '../forms/AD1Form';
import { AD1Form } from '../forms/AD1Form';

export const AD1CreateView = () => {
  const navigate = useNavigate();
  const { activeBranchId, user } = useAuth();
  const defaultValues = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return {
      transactionType: TransactionTypeEnum.PURCHASE,
      profileType: TransactionProfileType.AD1,
      branchId: activeBranchId ?? '',
      dealId: '',
      docNo: '',
      transactionDate: today,
      marketingId: '',
      segmentId: '',
      servicedBy: '',
      purposeId: '',
      remitterName: '',
      contactNo: '',
      email: '',
      address: '',
      pan: '',
      dateOfBirth: '',
      productId: '',
      beneficiaryName: '',
      beniAddress: '',
      beneAccountNumber: '',
      beneBankName: '',
      swiftCode: '',
      relationshipId: '',
      currencyId: '',
      fcVolume: '',
      saleRate: '',
      totalInrAmt: '',
      gst: '0',
      bankCharges: '0',
      tcs: '0',
      otherIncome: '0',
      finalAmount: '',
      settlementRate: '',
      grossRevenue: '',
      revenueReceivable: '0',
      fxRefAgentId: '',
      commGivenId: '',
      commPercentOnFe: '0',
      agentComm: '0',
      tds: '0',
      commissionPayable: '',
      netRevenue: '',
      bankNameId: '',
      rtgsImpsNeftRefNo: '',
      remarks: '',
    };
  }, [activeBranchId]);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-text-primary">Create AD1 Transaction</h1>
        <p className="text-sm text-text-secondary">
          Capture all remitter, beneficiary, settlement and commission details.
        </p>
      </div>

      <AD1Form
        defaultValues={defaultValues}
        user={user}
        onSubmit={async (values) => {
          await transactionAd1Api.create({
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

export default AD1CreateView;
