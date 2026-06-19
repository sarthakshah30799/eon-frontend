import { useNavigate, useParams } from 'react-router-dom';
import { usePermission } from '@/hooks';
import { useGetFfmcClient, useUpdateFfmcClient } from '../hooks';
import { FfmcClientForm } from '../forms/FfmcClientForm';
import type { ICreateFfmcClient } from '../types/ffmcClientTypes';

const formatDateForInput = (dateString?: string | Date) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

export const FfmcClientEditView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { canModify } = usePermission('/admin/ffmc-client-profile');

  const { data: client, isLoading, error } = useGetFfmcClient(id || '');
  const { updateFfmcClient, isPending } = useUpdateFfmcClient();

  const handleSubmit = async (values: ICreateFfmcClient) => {
    if (!id) return;
    const sanitized = {
      ...values,
      isFfmc: true,
      gstStateId: values.gstStateId || undefined,
      originBranchId: values.originBranchId || undefined,
      blockDateFrom: values.blockDateFrom || undefined,
      establishmentDate: values.establishmentDate || undefined,
      panDob: values.panDob || undefined,
      ffmcRegDate: values.ffmcRegDate || undefined,
      email: values.email || undefined,
    };
    await updateFfmcClient({ id, data: sanitized });
    navigate('/admin/ffmc-client-profile');
  };

  const handleCancel = () => navigate('/admin/ffmc-client-profile');

  if (isLoading) {
    return <div className="py-6 text-center text-text-secondary">Loading FFMC client details...</div>;
  }

  if (error || !client) {
    return (
      <div className="py-6 text-center text-error-600">
        Failed to load FFMC client details.
      </div>
    );
  }

  const defaultValues: ICreateFfmcClient = {
    isFfmc: true,
    ffmcRegNo: client.ffmcRegNo || '',
    ffmcRegDate: formatDateForInput(client.ffmcRegDate),
    dateOfIntro: formatDateForInput(client.dateOfIntro),
    code: client.code,
    name: client.name,
    isIndividual: client.isIndividual,
    creditLimit: client.creditLimit,
    creditDays: client.creditDays,
    temporaryCreditLimit: client.temporaryCreditLimit,
    temporaryCreditDays: client.temporaryCreditDays,
    permanentCreditLimit: client.permanentCreditLimit,
    permanentCreditDays: client.permanentCreditDays,
    address1: client.address1,
    address2: client.address2 || '',
    address3: client.address3 || '',
    city: client.city,
    pinCode: client.pinCode,
    kycApprovalNumber: client.kycApprovalNumber || '',
    kycRiskCategory: client.kycRiskCategory || '',
    chqTrxnLimit: client.chqTrxnLimit,
    defaultHandlingCharges: client.defaultHandlingCharges,
    defaultAgent: client.defaultAgent || '',
    phoneNo: client.phoneNo || '',
    blockDateFrom: formatDateForInput(client.blockDateFrom),
    establishmentDate: formatDateForInput(client.establishmentDate),
    remarks: client.remarks || '',
    email: client.email || '',
    contactName: client.contactName || '',
    designation: client.designation || '',
    group: client.group || '',
    entityType: client.entityType || '',
    panName: client.panName || '',
    panDob: formatDateForInput(client.panDob),
    panNo: client.panNo || '',
    marketingExecutive: client.marketingExecutive || '',
    businessNature: client.businessNature || '',
    isTdsDeducted: client.isTdsDeducted,
    tds: client.tds || '',
    tdsGroup: client.tdsGroup || '',
    active: client.active,
    printAddress: client.printAddress,
    eefcClient: client.eefcClient,
    sale: client.sale,
    purchase: client.purchase,
    applyTax: client.applyTax,
    igstOnly: client.igstOnly,
    gstNo: client.gstNo || '',
    sgstNo: client.sgstNo || '',
    igstNo: client.igstNo || '',
    gstStateId: client.gstStateId || '',
    originBranchId: client.originBranchId || '',
    isActive: client.isActive,
    location: client.location || '',
    webSite: client.webSite || '',
    accountHolderName: client.accountHolderName || '',
    bankName: client.bankName || '',
    accountNumber: client.accountNumber || '',
    ifscCode: client.ifscCode || '',
    bankAddress: client.bankAddress || '',
    cancelledChequeCopy: client.cancelledChequeCopy || '',
  };

  return (
    <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
      <FfmcClientForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isPending}
        disabled={!canModify}
      />
    </section>
  );
};

export default FfmcClientEditView;
