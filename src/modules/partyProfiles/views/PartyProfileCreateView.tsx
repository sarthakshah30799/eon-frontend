import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCreatePartyProfile } from '../hooks';
import { PartyProfileForm } from '../forms/PartyProfileForm';
import type { ICreatePartyProfile } from '../types';
import { DEFAULT_PARTY_PROFILE_TYPE } from '../constants';

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

export const PartyProfileCreateView = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedType = searchParams.get('type') || DEFAULT_PARTY_PROFILE_TYPE;
  const { submitPartyProfile, isPending } = useCreatePartyProfile();

  const defaultValues = useMemo(
    () => createEmptyPartyProfileValues(selectedType),
    [selectedType]
  );

  const handleSubmit = async (values: ICreatePartyProfile) => {
    const sanitized: ICreatePartyProfile = {
      ...values,
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
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isPending}
          submitLabel="Create Party Profile"
        />
      </section>
    </div>
  );
};

export default PartyProfileCreateView;
