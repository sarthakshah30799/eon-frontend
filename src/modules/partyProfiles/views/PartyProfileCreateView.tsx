import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreatePartyProfile, usePartyProfileTypes } from '../hooks';
import { PartyProfileForm } from '../forms/PartyProfileForm';
import type { ICreatePartyProfile } from '../types';
import { toPartyProfileApiType, toPartyProfileRouteType } from '../constants';
import { useAuth } from '@/lib';
import { buildPartyProfileDocumentsPath } from '@/modules/partyProfileDocuments/utils/partyProfileDocumentRoutes';
import { NotFoundState } from '@/components/ui/not-found-state';
import { usePermission } from '@/hooks';

const createEmptyPartyProfileValues = (): Omit<ICreatePartyProfile, 'type'> => {
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
    stateId: '',
    originBranchId: '',
    location: '',
    webSite: '',
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    bankBranchName: '',
    cancelledChequeCopy: '',
    rejectReason: '',
    ffmcRegNo: '',
    ffmcRegDate: '',
    divisionFactor: undefined,
    commissionRules: [],
  };
};

export const PartyProfileCreateView = () => {
  const navigate = useNavigate();
  const { type: routeType } = useParams<{ type?: string }>();
  const { activeBranchId, user } = useAuth();
  const isAdminUser = user?.isAdmin === true;

  const { data: typeOptions = [], isLoading: isTypesLoading } = usePartyProfileTypes();
  const routeOptions = useMemo(
    () =>
      typeOptions.map(option => ({
        value: toPartyProfileRouteType(option.value),
        label: option.label.toUpperCase(),
      })),
    [typeOptions]
  );
  const selectedType = routeType
    ? toPartyProfileRouteType(routeType)
    : routeOptions[0]?.value;
  const selectedApiType = useMemo(
    () => toPartyProfileApiType(selectedType),
    [selectedType]
  );
  const isInvalidTypeRoute = Boolean(routeType) && !routeOptions.some(option => option.value === selectedType);
  const { canAdd } = usePermission(
    selectedType ? `/party-profiles/${selectedType}` : '/party-profiles'
  );
  const { submitPartyProfile, isPending } = useCreatePartyProfile();

  useEffect(() => {
    if (!routeType && routeOptions[0]) {
      navigate(`/party-profiles/${routeOptions[0].value}/create`, {
        replace: true,
      });
    }
  }, [navigate, routeOptions, routeType]);

  const defaultValues = useMemo(() => createEmptyPartyProfileValues(), []);

  const formDefaultValues = useMemo(
    () => ({
      ...defaultValues,
      originBranchId: activeBranchId || '',
    }),
    [activeBranchId, defaultValues]
  );

  if (isTypesLoading) {
    return (
      <div className="py-6 text-center text-text-secondary">
        Loading party profile form...
      </div>
    );
  }

  if (!routeOptions.length || isInvalidTypeRoute || !canAdd) {
    return (
      <NotFoundState
        message="You do not have access to create this party profile type."
      />
    );
  }

  if (!selectedType) {
    return (
      <div className="py-6 text-center text-text-secondary">
        Loading party profile form...
      </div>
    );
  }

  const handleSubmit = async (values: Omit<ICreatePartyProfile, 'type'>) => {
    const sanitized: ICreatePartyProfile = {
      ...values,
      type: selectedApiType,
      rejectReason: undefined,
      gstStateId: values.gstStateId || undefined,
      stateId: values.stateId || undefined,
      originBranchId: values.originBranchId || undefined,
      blockDateFrom: values.blockDateFrom || undefined,
      establishmentDate: values.establishmentDate || undefined,
      panDob: values.panDob || undefined,
      email: values.email || undefined,
    };
    const created = await submitPartyProfile(sanitized);
    navigate(buildPartyProfileDocumentsPath(selectedApiType, created.id));
  };

  const handleCancel = () => {
    navigate({
      pathname: `/party-profiles/${selectedType}`,
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
          profileType={selectedApiType}
          currentId={undefined}
        />
      </section>
    </div>
  );
};

export default PartyProfileCreateView;
