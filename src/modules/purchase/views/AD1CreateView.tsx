import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { transactionAd1Api } from '@/api/transactionAd1/transactionAd1.api';
import { TransactionTypeEnum } from '@/modules/transactions';
import { TransactionProfileType } from '../forms/ad1ProfileType';
import { AD1Form } from '../forms/AD1Form';
import { useListAdditionalSettings } from '@/modules/additionalSettings/hooks';
import { getAdditionalSettingBooleanValue } from '@/modules/additionalSettings/utils';
import { AdditionalSettingsCodeEnum } from '@/modules/additionalSettings/constants';

export const AD1CreateView = () => {
  const navigate = useNavigate();
  const { activeBranchId } = useAuth();

  const { data: additionalSettings = [] } = useListAdditionalSettings();

  const requiresApproval = useMemo(
    () =>
      getAdditionalSettingBooleanValue(
        additionalSettings,
        AdditionalSettingsCodeEnum.TransactionApprovalPolicy,
        AdditionalSettingsCodeEnum.PurchaseAd1,
        false,
      ),
    [additionalSettings],
  );

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
      agentId: '',
      commGiven: '',
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
        submitLabel={requiresApproval ? 'Submit for Approval' : 'Create'}
        onSubmit={async (values) => {
          await transactionAd1Api.create({
            transactionType: values.transactionType as string,
            profileType: values.profileType as string,
            requiresApproval,
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
          navigate('/ad1');
        }}
        onCancel={() => navigate('/ad1')}
      />
    </div>
  );
};

export default AD1CreateView;
