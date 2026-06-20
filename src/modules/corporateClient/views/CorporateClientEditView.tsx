import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { usePermission } from '@/hooks';
import { useGetCorporateClient, useUpdateCorporateClient } from '../hooks';
import { CorporateClientForm } from '../forms/CorporateClientForm';
import type { ICreateCorporateClient } from '../types';

const formatDateForInput = (dateString?: string | Date) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

export const CorporateClientEditView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rawType = searchParams.get('type') || 'corporate_client';
  const selectedType = rawType === 'corporate-client-profile' ? 'corporate_client' : rawType;
  const { canModify } = usePermission('/admin/corporate-client-profile');

  const { data: client, isLoading, error } = useGetCorporateClient(
    id || ''
  );
  const { updateCorporateClient, isPending } =
    useUpdateCorporateClient();

  const handleSubmit = async (values: ICreateCorporateClient) => {
    if (!id) return;
    const sanitized = {
      ...values,
      gstStateId: values.gstStateId || undefined,
      originBranchId: values.originBranchId || undefined,
      blockDateFrom: values.blockDateFrom || undefined,
      establishmentDate: values.establishmentDate || undefined,
      panDob: values.panDob || undefined,
      email: values.email || undefined,
    };
    await updateCorporateClient({ id, data: sanitized });
    navigate({
      pathname: '/admin/corporate-client-profile',
      search: `?type=${values.type || selectedType}`,
    });
  };

  const handleCancel = () => {
    navigate({
      pathname: '/admin/corporate-client-profile',
      search: `?type=${selectedType}`,
    });
  };

  if (isLoading) {
    return <div className="py-6 text-center text-text-secondary">Loading corporate client details...</div>;
  }

  if (error || !client) {
    return (
      <div className="py-6 text-center text-error-600">
        Failed to load corporate client details.
      </div>
    );
  }

  const defaultValues: ICreateCorporateClient = {
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
    type: client.type,
    ffmcRegNo: client.ffmcRegNo || '',
    ffmcRegDate: formatDateForInput(client.ffmcRegDate),
  };

  return (
    <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
      <CorporateClientForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isPending}
        disabled={!canModify}
        submitLabel="Save Changes"
      />
    </section>
  );
};

export default CorporateClientEditView;
