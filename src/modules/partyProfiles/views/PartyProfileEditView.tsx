import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePermission } from '@/hooks';
import { useGetPartyProfile, usePartyProfileTypes, useUpdatePartyProfile } from '../hooks';
import { PartyProfileForm } from '../forms/PartyProfileForm';
import type { ICreatePartyProfile } from '../types';
import {
  toPartyProfileApiType,
  toPartyProfileRouteType,
} from '../constants';

const formatDateForInput = (dateString?: string | Date) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

export const PartyProfileEditView = () => {
  const { id, type: routeType } = useParams<{ id: string; type?: string }>();
  const navigate = useNavigate();
  const { data: typeOptions = [] } = usePartyProfileTypes();
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
  const { canModify } = usePermission('/party-profiles');

  const { data: client, isLoading, error } = useGetPartyProfile(
    id || '',
    selectedApiType,
    Boolean(selectedApiType)
  );
  const { updatePartyProfile, isPending } =
    useUpdatePartyProfile(selectedApiType);

  useEffect(() => {
    if (!routeType && routeOptions[0]) {
      navigate(`/party-profiles/${routeOptions[0].value}/edit/${id}`, {
        replace: true,
      });
    }
  }, [id, navigate, routeOptions, routeType]);

  const defaultValues: ICreatePartyProfile = {
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
    kycRiskCategory: client?.kycRiskCategory || '',
    chqTrxnLimit: client?.chqTrxnLimit,
    defaultHandlingCharges: client?.defaultHandlingCharges,
    defaultAgent: client?.defaultAgent || '',
    phoneNo: client?.phoneNo || '',
    blockDateFrom: formatDateForInput(client?.blockDateFrom),
    establishmentDate: formatDateForInput(client?.establishmentDate),
    remarks: client?.remarks || '',
    email: client?.email || '',
    contactName: client?.contactName || '',
    designation: client?.designation || '',
    group: client?.group || '',
    entityType: client?.entityType || '',
    panName: client?.panName || '',
    panDob: formatDateForInput(client?.panDob),
    panNo: client?.panNo || '',
    marketingExecutive: client?.marketingExecutive || '',
    businessNature: client?.businessNature || '',
    isTdsDeducted: client?.isTdsDeducted ?? false,
    tds: client?.tds || '',
    tdsGroup: client?.tdsGroup || '',
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
    originBranchId: client?.originBranchId || '',
    isActive: client?.isActive ?? false,
    location: client?.location || '',
    webSite: client?.webSite || '',
    accountHolderName: client?.accountHolderName || '',
    bankName: client?.bankName || '',
    accountNumber: client?.accountNumber || '',
    ifscCode: client?.ifscCode || '',
    bankAddress: client?.bankAddress || '',
    cancelledChequeCopy: client?.cancelledChequeCopy || '',
    type: client?.type || selectedApiType,
    ffmcRegNo: client?.ffmcRegNo || '',
    ffmcRegDate: formatDateForInput(client?.ffmcRegDate),
  };

  if (!selectedType) {
    return <div className="py-6 text-center text-text-secondary">Loading party profile details...</div>;
  }

  const handleSubmit = async (values: ICreatePartyProfile) => {
    if (!id) return;
    const sanitized = {
      ...values,
      gstStateId: values.gstStateId || undefined,
      originBranchId: values.originBranchId || undefined,
      blockDateFrom: values.blockDateFrom || undefined,
      establishmentDate: values.establishmentDate || undefined,
      panDob: values.panDob || undefined,
      email: values.email || undefined,
    };
    await updatePartyProfile({ id, data: sanitized });
    navigate({
      pathname: `/party-profiles/${toPartyProfileRouteType(values.type || selectedApiType)}`,
    });
  };

  const handleCancel = () => {
    navigate({
      pathname: `/party-profiles/${selectedType}`,
    });
  };

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
    <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
      <PartyProfileForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isPending}
        disabled={!canModify}
        submitLabel="Save Changes"
      />
    </section>
  );
};

export default PartyProfileEditView;
