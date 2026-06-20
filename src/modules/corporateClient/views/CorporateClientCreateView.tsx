import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCreateCorporateClient } from '../hooks';
import { CorporateClientForm } from '../forms/CorporateClientForm';
import type { ICreateCorporateClient } from '../types';

const createEmptyCorporateClientValues = (
  type: string
): ICreateCorporateClient => {
  return {
    dateOfIntro: new Date().toISOString().split('T')[0],
    code: '',
    name: '',
    isIndividual: false,
    creditLimit: undefined,
    creditDays: undefined,
    temporaryCreditLimit: undefined,
    temporaryCreditDays: undefined,
    permanentCreditLimit: undefined,
    permanentCreditDays: undefined,
    address1: '',
    address2: '',
    address3: '',
    city: '',
    pinCode: '',
    kycApprovalNumber: '',
    kycRiskCategory: '',
    chqTrxnLimit: undefined,
    defaultHandlingCharges: undefined,
    defaultAgent: '',
    phoneNo: '',
    blockDateFrom: '',
    establishmentDate: '',
    remarks: '',
    email: '',
    contactName: '',
    designation: '',
    group: '',
    entityType: '',
    panName: '',
    panDob: '',
    panNo: '',
    marketingExecutive: '',
    businessNature: '',
    isTdsDeducted: false,
    tds: '',
    tdsGroup: '',
    active: true,
    printAddress: false,
    eefcClient: false,
    sale: false,
    purchase: false,
    applyTax: false,
    igstOnly: false,
    gstNo: '',
    sgstNo: '',
    igstNo: '',
    gstStateId: '',
    originBranchId: '',
    isActive: false,
    location: '',
    webSite: '',
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    bankAddress: '',
    cancelledChequeCopy: '',
    type,
    ffmcRegNo: '',
    ffmcRegDate: '',
  };
};

export const CorporateClientCreateView = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rawType = searchParams.get('type') || 'corporate_client';
  const selectedType = rawType === 'corporate-client-profile' ? 'corporate_client' : rawType;
  const { submitCorporateClient, isPending } = useCreateCorporateClient();

  const defaultValues = useMemo(
    () => createEmptyCorporateClientValues(selectedType),
    [selectedType]
  );

  const handleSubmit = async (values: ICreateCorporateClient) => {
    const sanitized: ICreateCorporateClient = {
      ...values,
      gstStateId: values.gstStateId || undefined,
      originBranchId: values.originBranchId || undefined,
      blockDateFrom: values.blockDateFrom || undefined,
      establishmentDate: values.establishmentDate || undefined,
      panDob: values.panDob || undefined,
      email: values.email || undefined,
    };
    await submitCorporateClient(sanitized);
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

  return (
    <div className="space-y-6">
      <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
        <CorporateClientForm
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isPending}
          submitLabel="Create Corporate Client"
        />
      </section>
    </div>
  );
};

export default CorporateClientCreateView;
