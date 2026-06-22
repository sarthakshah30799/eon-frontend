import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useCreatePartyProfile } from '../hooks';
import { PartyProfileForm } from '../forms/PartyProfileForm';
import type { ICreatePartyProfile } from '../types';

const createEmptyPartyProfileValues = (
  type: string
): ICreatePartyProfile => {
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
    active: false,
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
    rejectReason: '',
    type,
    ffmcRegNo: '',
    ffmcRegDate: '',
  };
};

export const PartyProfileCreateView = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { activeBranchId, user } = useAuth();
  const selectedType = searchParams.get('type') || 'CORPORATE_CLIENT';
  const { submitPartyProfile, isPending } = useCreatePartyProfile();
  const isAdminUser = user?.isAdmin === true;

  const defaultValues = useMemo(
    () => createEmptyPartyProfileValues(selectedType),
    [selectedType]
  );

  const formDefaultValues = useMemo(
    () => ({
      ...defaultValues,
      originBranchId: activeBranchId || '',
    }),
    [activeBranchId, defaultValues]
  );

  const handleSubmit = async (values: ICreatePartyProfile) => {
    const sanitized: ICreatePartyProfile = {
      ...values,
      rejectReason: undefined,
      gstStateId: values.gstStateId || undefined,
      originBranchId: values.originBranchId || undefined,
      blockDateFrom: values.blockDateFrom || undefined,
      establishmentDate: values.establishmentDate || undefined,
      panDob: values.panDob || undefined,
      email: values.email || undefined,
    };
    await submitPartyProfile(sanitized);
    navigate({
      pathname: '/party-profiles',
      search: `?type=${values.type || selectedType}`,
    });
  };

  const handleCancel = () => {
    navigate({
      pathname: '/party-profiles',
      search: `?type=${selectedType}`,
    });
  };

  return (
    <div className="space-y-6">
      <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
        <PartyProfileForm
          defaultValues={formDefaultValues}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isPending}
          submitLabel="Create Party Profile"
          originBranchDisabled={!isAdminUser}
        />
      </section>
    </div>
  );
};

export default PartyProfileCreateView;
