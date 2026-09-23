import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { usePermission } from '@/hooks';
import type { AsyncSelectOption } from '@/components/ui';
import {
  useGetPartyProfile,
  usePartyProfileTypes,
  useReviewPartyProfile,
  useUpdatePartyProfileBranches,
  useUpgradePartyProfileCreditPolicy,
} from '../hooks';
import { PartyProfileForm } from '../forms/PartyProfileForm';
import type { PartyProfileFormSubmitMeta } from '../forms/PartyProfileForm';
import type { ICreatePartyProfile, IReviewPartyProfilePayload } from '../types';
import {
  toPartyProfileApiType,
  toPartyProfileRouteType,
  PARTY_PROFILE_STATUS_TEXT,
} from '../constants';
import { PartyProfileDocumentsActionButton } from '../components';
import { NotFoundState } from '@/components/ui/not-found-state';
import { AccessDeniedState } from '@/components/ui/access-denied-state';
import type { PartyProfileType } from '../types/partyProfileTypes';
import { PartyProfileTypeEnum } from '../types/partyProfileTypes';
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
  const { upgradePartyProfileCreditPolicy, isPending: isUpgradingCreditPolicy } =
    useUpgradePartyProfileCreditPolicy(selectedApiType);
  const { updatePartyProfileBranches, isPending: isUpdatingBranches } =
    useUpdatePartyProfileBranches(selectedApiType);
  const { reviewPartyProfile, isPending: isReviewing } =
    useReviewPartyProfile();

  useEffect(() => {
    if (!routeType && routeOptions[0] && id) {
      navigate(`/party-profiles/${routeOptions[0].value}/edit/${id}`, {
        replace: true,
      });
    }
  }, [id, navigate, routeOptions, routeType]);

  const assignedBranchIds = useMemo(() => {
    if (client?.branchIds?.length) {
      return client.branchIds.filter(Boolean);
    }
    return (client?.branches ?? []).map(branch => branch.id).filter(Boolean);
  }, [client]);

  const branchDefaultOptions = useMemo<AsyncSelectOption[]>(
    () =>
      (client?.branches ?? []).map(branch => ({
        value: branch.id,
        label: `${branch.code} - ${branch.name}`,
      })),
    [client?.branches]
  );

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
      branchIds: assignedBranchIds,
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
      cardNumberLength: client?.cardNumberLength ?? 16,
      allowCardNumberMasking: client?.allowCardNumberMasking ?? false,
      divisionFactor: client?.divisionFactor,
      dateOfJoining: formatDateForInput(client?.dateOfJoining),
      dateOfExit: formatDateForInput(client?.dateOfExit),
      basicSalary: client?.basicSalary ?? 0,
      netSalary: client?.netSalary ?? 0,
      dareness: client?.dareness ?? 0,
      houseRent: client?.houseRent ?? 0,
      conveyance: client?.conveyance ?? 0,
      specialAllowance: client?.specialAllowance ?? 0,
      otherAllowance: client?.otherAllowance ?? 0,
      allowanceTotal: client?.allowanceTotal ?? 0,
      pf: client?.pf ?? 0,
      ppf: client?.ppf ?? 0,
      pTax: client?.pTax ?? 0,
      esic: client?.esic ?? 0,
      incomeTax: client?.incomeTax ?? 0,
      otherDeduction: client?.otherDeduction ?? 0,
      deductionTotal: client?.deductionTotal ?? 0,
      commissionRules: client?.commissionRules ?? [],
    }),
    [assignedBranchIds, client]
  );

  const handleSubmit = async (
    _values: Omit<ICreatePartyProfile, 'type'>,
    meta?: PartyProfileFormSubmitMeta
  ) => {
    if (!id) return;

    const creditPolicyPayload = meta?.creditPolicyPayload ?? {};
    const hasCreditUpdates =
      meta?.creditUpgradeMode && Object.keys(creditPolicyPayload).length > 0;
    const hasBranchUpdates =
      Boolean(meta?.branchUpdateMode) &&
      Array.isArray(meta?.branchIds) &&
      meta.branchIds.length > 0;

    if (hasCreditUpdates) {
      await upgradePartyProfileCreditPolicy({
        id,
        data: creditPolicyPayload,
      });
    } else if (hasBranchUpdates) {
      await updatePartyProfileBranches({
        id,
        data: { branchIds: meta!.branchIds! },
      });
    } else {
      return;
    }

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

  if (isInvalidTypeRoute) {
    return <NotFoundState message={PARTY_PROFILE_STATUS_TEXT.typeNotFound} />;
  }

  if (!routeOptions.length || (!canModify && !canView)) {
    return (
      <AccessDeniedState message={PARTY_PROFILE_STATUS_TEXT.accessDeniedEdit} />
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
    return (
      <NotFoundState message={PARTY_PROFILE_STATUS_TEXT.detailsNotFound} />
    );
  }

  const canEditPartyProfile =
    canModify && (isAdminUser || client.createdBy.id === user?.id);
  const hideCreditPolicySection =
    selectedApiType === PartyProfileTypeEnum.MISC_PROFILE ||
    selectedApiType === PartyProfileTypeEnum.EMPLOYEE_PROFILE;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <PartyProfileDocumentsActionButton
          partyProfileId={id || ''}
          partyProfileType={selectedApiType}
          label="Upload Documents"
        />
      </div>
      <section className="rounded-sm border border-border-primary bg-surface-primary p-3 shadow-sm">
        <PartyProfileForm
          defaultValues={defaultValues}
          onSubmit={!canEditPartyProfile ? async () => undefined : handleSubmit}
          profileType={selectedApiType}
          onCancel={handleCancel}
          onReviewSubmit={handleReviewSubmit}
          isSubmitting={
            isReviewing || isUpgradingCreditPolicy || isUpdatingBranches
          }
          disabled={true}
          reviewMode={showReviewControls}
          showSubmit={canEditPartyProfile}
          allowCreditPolicyUpgrade={
            canEditPartyProfile && !hideCreditPolicySection
          }
          allowBranchUpdate={canEditPartyProfile}
          submitLabel="Save Changes"
          currentId={id}
          branchDefaultOptions={branchDefaultOptions}
        />
      </section>
    </div>
  );
};

export default PartyProfileEditView;
