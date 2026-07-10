import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { usePermission } from '@/hooks';
import {
  useGetPartyProfile,
  usePartyProfileTypes,
  useReviewPartyProfile,
  useUpdatePartyProfile,
} from '../hooks';
import { PartyProfileForm } from '../forms/PartyProfileForm';
import type { ICreatePartyProfile, IReviewPartyProfilePayload } from '../types';
import { toPartyProfileApiType, toPartyProfileRouteType } from '../constants';
import { PartyProfileDocumentsActionButton } from '../components';
import { NotFoundState } from '@/components/ui/not-found-state';
import type { PartyProfileType } from '../types/partyProfileTypes';

const formatDateForInput = (dateString?: string | Date) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

export const PartyProfileEditView = () => {
  const { id, type: routeType } = useParams<{ id: string; type?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdminUser = user?.isAdmin === true;
  const isReviewer = Boolean(user?.isAdmin || user?.isHo || user?.isHoStaff);
  const showReviewControls = Boolean(isReviewer);

  const { data: typeOptions = [], isLoading: isTypesLoading } =
    usePartyProfileTypes();
  const routeOptions = useMemo(
    () =>
      typeOptions.map(option => ({
        value: toPartyProfileRouteType(option.value),
        label: option.label.toUpperCase(),
      })),
    [typeOptions]
  );
  const selectedType = useMemo(
    () =>
      routeType ? toPartyProfileRouteType(routeType) : routeOptions[0]?.value,
    [routeOptions, routeType]
  );
  const selectedApiType = useMemo(
    () => toPartyProfileApiType(selectedType) as PartyProfileType,
    [selectedType]
  );
  const { canModify, canView } = usePermission(
    selectedType ? `/party-profiles/${selectedType}` : '/party-profiles'
  );
  const isInvalidTypeRoute =
    Boolean(routeType) &&
    !routeOptions.some(option => option.value === selectedType);

  const {
    data: client,
    isLoading,
    error,
  } = useGetPartyProfile(
    id || '',
    selectedApiType,
    Boolean(selectedApiType) && !isInvalidTypeRoute
  );
  const { updatePartyProfile, isPending } =
    useUpdatePartyProfile(selectedApiType);
  const { reviewPartyProfile, isPending: isReviewing } =
    useReviewPartyProfile();

  useEffect(() => {
    if (!routeType && routeOptions[0] && id) {
      navigate(`/party-profiles/${routeOptions[0].value}/edit/${id}`, {
        replace: true,
      });
    }
  }, [id, navigate, routeOptions, routeType]);

  const defaultValues: Omit<ICreatePartyProfile, 'type'> = useMemo(
    () => ({
      dateOfIntro: formatDateForInput(client?.dateOfIntro),
      code: client?.code ?? '',
      name: client?.name ?? '',
      isIndividual: client?.isIndividual ?? false,
      creditLimit: client?.creditLimit,
      creditDays: client?.creditDays,
      temporaryCreditLimit: client?.temporaryCreditLimit,
      temporaryCreditDays: client?.temporaryCreditDays,
      permanentCreditLimit: client?.permanentCreditLimit,
      permanentCreditDays: client?.permanentCreditDays,
      address1: client?.address1 ?? '',
      address2: client?.address2 || '',
      address3: client?.address3 || '',
      city: client?.city ?? '',
      pinCode: client?.pinCode ?? '',
      kycApprovalNumber: client?.kycApprovalNumber || '',
      kycRiskCategory: client?.kycRiskCategory?.id || '',
      chqTrxnLimit: client?.chqTrxnLimit,
      defaultHandlingCharges: client?.defaultHandlingCharges,
      defaultAgent: client?.defaultAgent?.id || '',
      phoneNo: client?.phoneNo || '',
      blockDateFrom: formatDateForInput(client?.blockDateFrom),
      establishmentDate: formatDateForInput(client?.establishmentDate),
      remarks: client?.remarks || '',
      email: client?.email || '',
      contactName: client?.contactName || '',
      designation: client?.designation || '',
      group: client?.group?.id || '',
      entityType: client?.entityType?.id || '',
      panName: client?.panName || '',
      panDob: formatDateForInput(client?.panDob),
      panNo: client?.panNo || '',
      marketingExecutive: client?.marketingExecutive?.id || '',
      businessNature: client?.businessNature?.id || '',
      isTdsDeducted: client?.isTdsDeducted ?? false,
      tdsGroup: client?.tdsGroup?.id || '',
      printAddress: client?.printAddress ?? false,
      eefcClient: client?.eefcClient ?? false,
      sale: client?.sale ?? false,
      purchase: client?.purchase ?? false,
      applyTax: client?.applyTax ?? false,
      igstOnly: client?.igstOnly ?? false,
      gstNo: client?.gstNo || '',
      sgstNo: client?.sgstNo || '',
      igstNo: client?.igstNo || '',
      gstStateId: client?.gstStateId || '',
      stateId: client?.stateId || '',
      branchId: client?.branchId || '',
      location: client?.location?.id || '',
      webSite: client?.webSite || '',
      accountHolderName: client?.accountHolderName || '',
      bankName: client?.bankName || '',
      accountNumber: client?.accountNumber || '',
      ifscCode: client?.ifscCode || '',
      bankBranchName: client?.bankBranchName || '',
      cancelledChequeCopy: client?.cancelledChequeCopy || '',
      rejectReason: '',
      ffmcRegNo: client?.ffmcRegNo || '',
      ffmcRegDate: formatDateForInput(client?.ffmcRegDate),
      divisionFactor: client?.divisionFactor,
      commissionRules: client?.commissionRules ?? [],
    }),
    [client]
  );

  const handleSubmit = async (values: Omit<ICreatePartyProfile, 'type'>) => {
    if (!id) return;
    const sanitized: ICreatePartyProfile = {
      ...values,
      type: selectedApiType,
      rejectReason: undefined,
      gstStateId: values.gstStateId || undefined,
      stateId: values.stateId || undefined,
      branchId: values.branchId || undefined,
      blockDateFrom: values.blockDateFrom || undefined,
      establishmentDate: values.establishmentDate || undefined,
      panDob: values.panDob || undefined,
      email: values.email || undefined,
    };
    await updatePartyProfile({ id, data: sanitized });
    navigate({
      pathname: `/party-profiles/${selectedType}`,
    });
  };

  const handleReviewSubmit = async (values: IReviewPartyProfilePayload) => {
    if (!id) return;

    await reviewPartyProfile({
      id,
      data: values,
    });

    navigate({
      pathname: `/party-profiles/${selectedType}`,
    });
  };

  const handleCancel = () => {
    navigate({
      pathname: `/party-profiles/${selectedType}`,
    });
  };

  if (isTypesLoading) {
    return (
      <div className="py-6 text-center text-text-secondary">
        Loading party profile details...
      </div>
    );
  }

  if (!routeOptions.length || isInvalidTypeRoute || (!canModify && !canView)) {
    return (
      <NotFoundState message="You do not have access to edit this party profile type." />
    );
  }

  if (!selectedType) {
    return (
      <div className="py-6 text-center text-text-secondary">
        Loading party profile details...
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="py-6 text-center text-text-secondary">
        Loading party profile details...
      </div>
    );
  }

  if (error || !client) {
    return <NotFoundState message="Party profile details were not found." />;
  }

  const canEditPartyProfile =
    canModify && (isAdminUser || client.createdBy.id === user?.id);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <PartyProfileDocumentsActionButton
          partyProfileId={id || ''}
          partyProfileType={selectedApiType}
          label="Upload Documents"
        />
      </div>
      <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
        <PartyProfileForm
          defaultValues={defaultValues}
          onSubmit={
            showReviewControls || !canEditPartyProfile
              ? async () => undefined
              : handleSubmit
          }
          profileType={selectedApiType}
          onCancel={handleCancel}
          onReviewSubmit={handleReviewSubmit}
          isSubmitting={isPending || isReviewing}
          disabled={showReviewControls ? true : !canEditPartyProfile}
          reviewMode={showReviewControls}
          showSubmit={!showReviewControls && canEditPartyProfile}
          submitLabel="Save Changes"
          branchDisabled={!isAdminUser}
          currentId={id}
        />
      </section>
    </div>
  );
};

export default PartyProfileEditView;
