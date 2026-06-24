import { useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
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
import {
  toPartyProfileApiType,
  toPartyProfileRouteType,
} from '../constants';
import { PartyProfileDocumentsActionButton } from '../components';

const formatDateForInput = (dateString?: string | Date) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

export const PartyProfileEditView = () => {
  const { id, type: routeType } = useParams<{ id: string; type?: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isReviewMode = searchParams.get('review') === '1';
  const { user } = useAuth();
  const isReviewer = Boolean(user?.isAdmin || user?.isHo || user?.isHoStaff);
  const showReviewControls = Boolean(isReviewer && (isReviewMode || user?.isAdmin));
  const { canModify } = usePermission('/party-profiles');

  const { data: typeOptions = [] } = usePartyProfileTypes();
  const routeOptions = useMemo(
    () =>
      typeOptions.map(option => ({
        value: toPartyProfileRouteType(option.value),
        label: option.label.toUpperCase(),
      })),
    [typeOptions]
  );
  const selectedType = useMemo(
    () => (routeType ? toPartyProfileRouteType(routeType) : routeOptions[0]?.value),
    [routeOptions, routeType]
  );
  const selectedApiType = useMemo(
    () => toPartyProfileApiType(selectedType),
    [selectedType]
  );

  const { data: client, isLoading, error } = useGetPartyProfile(
    id || '',
    selectedApiType,
    Boolean(selectedApiType)
  );
  const { updatePartyProfile, isPending } = useUpdatePartyProfile(selectedApiType);
  const { reviewPartyProfile, isPending: isReviewing } = useReviewPartyProfile();

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
      tds: client?.tds || '',
      tdsGroup: client?.tdsGroup?.id || '',
      active: client?.active ?? false,
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
      originBranchId: client?.originBranchId || '',
      isActive: client?.isActive ?? false,
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
      originBranchId: values.originBranchId || undefined,
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

  if (!selectedType) {
    return <div className="py-6 text-center text-text-secondary">Loading party profile details...</div>;
  }

  if (isLoading) {
    return <div className="py-6 text-center text-text-secondary">Loading party profile details...</div>;
  }

  if (error || !client) {
    return (
      <div className="py-6 text-center text-error-600">
        Failed to load party profile details.
      </div>
    );
  }

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
          onSubmit={showReviewControls ? async () => undefined : handleSubmit}
          profileType={selectedApiType}
          onCancel={handleCancel}
          onReviewSubmit={handleReviewSubmit}
          isSubmitting={isPending || isReviewing}
          disabled={showReviewControls ? true : !canModify}
          reviewMode={showReviewControls}
          submitLabel="Save Changes"
          currentId={id}
        />
      </section>
    </div>
  );
};

export default PartyProfileEditView;
