import { useNavigate } from 'react-router-dom';
import { useCreateCorporateClient } from '../hooks';
import { CorporateClientForm } from '../forms/CorporateClientForm';
import type { ICreateCorporateClient } from '../types';

export const createEmptyCorporateClientValues = (): ICreateCorporateClient => ({
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
});

export const CorporateClientCreateView = () => {
  const navigate = useNavigate();
  const { submitCorporateClient, isPending } = useCreateCorporateClient();

  const handleSubmit = async (values: ICreateCorporateClient) => {
    // Sanitize optional fields to avoid empty string database reference errors
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
    navigate('/admin/corporate-client-profile');
  };

  const handleCancel = () => {
    navigate('/admin/corporate-client-profile');
  };

  return (
    <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
      <CorporateClientForm
        defaultValues={createEmptyCorporateClientValues()}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isPending}
      />
    </section>
  );
};

export default CorporateClientCreateView;
