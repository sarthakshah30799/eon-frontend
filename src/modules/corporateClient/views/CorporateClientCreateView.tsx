import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCreateCorporateClient } from '../hooks';
import { CorporateClientProfileTypeSelect } from '../components';
import { CorporateClientForm } from '../forms/CorporateClientForm';
import type { ICreateCorporateClient } from '../types';
import {
  getCorporateClientProfileTypeConfig,
  normalizeCorporateClientProfileType,
} from '../constants';

const createEmptyCorporateClientValues = (
  profileType: string
): ICreateCorporateClient => {
  const profileTypeConfig = getCorporateClientProfileTypeConfig(profileType);

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
    group: String(profileTypeConfig.groupOptions[0]?.value ?? ''),
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
  };
};

export const CorporateClientCreateView = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedProfileType = normalizeCorporateClientProfileType(
    searchParams.get('type')
  );
  const selectedProfileTypeConfig = getCorporateClientProfileTypeConfig(
    selectedProfileType
  );
  const { submitCorporateClient, isPending } =
    useCreateCorporateClient(selectedProfileType);

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
    navigate({
      pathname: '/corporate-client-profile',
      search: `?type=${selectedProfileType}`,
    });
  };

  const handleCancel = () => {
    navigate({
      pathname: '/corporate-client-profile',
      search: `?type=${selectedProfileType}`,
    });
  };

  return (
    <div className="space-y-6">
      <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <CorporateClientProfileTypeSelect
            value={selectedProfileType}
            onChange={nextType => {
              navigate({
                pathname: '/corporate-client-profile/create',
                search: `?type=${nextType}`,
              });
            }}
            label="Profile Type"
          />

          <div className="hidden lg:block" />
        </div>

        <CorporateClientForm
          defaultValues={createEmptyCorporateClientValues(selectedProfileType)}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isPending}
          submitLabel={selectedProfileTypeConfig.createButtonLabel}
          profileType={selectedProfileType}
        />
      </section>
    </div>
  );
};

export default CorporateClientCreateView;
