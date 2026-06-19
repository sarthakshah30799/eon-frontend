import { useNavigate } from 'react-router-dom';
import { useCreateFfmcClient } from '../hooks';
import { FfmcClientForm } from '../forms/FfmcClientForm';
import type { ICreateFfmcClient } from '../types/ffmcClientTypes';

export const createEmptyFfmcClientValues = (): ICreateFfmcClient => ({
  isFfmc: true,
  ffmcRegNo: '',
  ffmcRegDate: '',
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

export const FfmcClientCreateView = () => {
  const navigate = useNavigate();
  const { submitFfmcClient, isPending } = useCreateFfmcClient();

  const handleSubmit = async (values: ICreateFfmcClient) => {
    const sanitized: ICreateFfmcClient = {
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
    await submitFfmcClient(sanitized);
    navigate('/admin/ffmc-client-profile');
  };

  const handleCancel = () => navigate('/admin/ffmc-client-profile');

  return (
    <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
      <FfmcClientForm
        defaultValues={createEmptyFfmcClientValues()}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isPending}
      />
    </section>
  );
};

export default FfmcClientCreateView;
