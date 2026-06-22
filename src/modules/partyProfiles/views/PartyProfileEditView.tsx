import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { usePermission } from '@/hooks';
import {
  useGetPartyProfile,
  useReviewPartyProfile,
  useUpdatePartyProfile,
} from '../hooks';
import { PartyProfileForm } from '../forms/PartyProfileForm';
import type { ICreatePartyProfile, IReviewPartyProfilePayload } from '../types';

const formatDateForInput = (dateString?: string | Date) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

export const PartyProfileEditView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedType = searchParams.get('type') || 'CORPORATE_CLIENT';
  const isReviewMode = searchParams.get('review') === '1';
  const { user } = useAuth();
  const isReviewer = Boolean(user?.isAdmin || user?.isHo || user?.isHoStaff);
  const showReviewControls = Boolean(
    isReviewer && (isReviewMode || user?.isAdmin)
  );
  const { canModify } = usePermission('/party-profiles');

  const { data: client, isLoading, error } = useGetPartyProfile(
    id || ''
  );
  const { updatePartyProfile, isPending } =
    useUpdatePartyProfile();
  const { reviewPartyProfile, isPending: isReviewing } = useReviewPartyProfile();

  const handleSubmit = async (values: ICreatePartyProfile) => {
    if (!id) return;
    const sanitized = {
      ...values,
      rejectReason: undefined,
      gstStateId: values.gstStateId || undefined,
      originBranchId: values.originBranchId || undefined,
      blockDateFrom: values.blockDateFrom || undefined,
      establishmentDate: values.establishmentDate || undefined,
      panDob: values.panDob || undefined,
      email: values.email || undefined,
    };
    await updatePartyProfile({ id, data: sanitized });
    navigate({
      pathname: '/party-profiles',
      search: `?type=${values.type || selectedType}`,
    });
  };

  const handleReviewSubmit = async (values: IReviewPartyProfilePayload) => {
    if (!id) return;

    await reviewPartyProfile({
      id,
      data: values,
    });

    navigate({
      pathname: '/party-profiles',
      search: `?type=${selectedType}`,
    });
  };

  const handleCancel = () => {
    navigate({
      pathname: '/party-profiles',
      search: `?type=${selectedType}`,
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

  const defaultValues: ICreatePartyProfile = {
    dateOfIntro: formatDateForInput(client.dateOfIntro),
    code: client.code,
    name: client.name,
    isIndividual: client.isIndividual,
    creditLimit: client.creditLimit,
    creditDays: client.creditDays,
    temporaryCreditLimit: client.temporaryCreditLimit,
    temporaryCreditDays: client.temporaryCreditDays,
    permanentCreditLimit: client.permanentCreditLimit,
    permanentCreditDays: client.permanentCreditDays,
    address1: client.address1,
    address2: client.address2 || '',
    address3: client.address3 || '',
    city: client.city,
    pinCode: client.pinCode,
    kycApprovalNumber: client.kycApprovalNumber || '',
    kycRiskCategory: client.kycRiskCategory || '',
    chqTrxnLimit: client.chqTrxnLimit,
    defaultHandlingCharges: client.defaultHandlingCharges,
    defaultAgent: client.defaultAgent || '',
    phoneNo: client.phoneNo || '',
    blockDateFrom: formatDateForInput(client.blockDateFrom),
    establishmentDate: formatDateForInput(client.establishmentDate),
    remarks: client.remarks || '',
    email: client.email || '',
    contactName: client.contactName || '',
    designation: client.designation || '',
    group: client.group || '',
    entityType: client.entityType || '',
    panName: client.panName || '',
    panDob: formatDateForInput(client.panDob),
    panNo: client.panNo || '',
    marketingExecutive: client.marketingExecutive || '',
    businessNature: client.businessNature || '',
    isTdsDeducted: client.isTdsDeducted,
    tds: client.tds || '',
    tdsGroup: client.tdsGroup || '',
    active: client.active,
    printAddress: client.printAddress,
    eefcClient: client.eefcClient,
    sale: client.sale,
    purchase: client.purchase,
    applyTax: client.applyTax,
    igstOnly: client.igstOnly,
    gstNo: client.gstNo || '',
    sgstNo: client.sgstNo || '',
    igstNo: client.igstNo || '',
    gstStateId: client.gstStateId || '',
    originBranchId: client.originBranchId || '',
    isActive: client.isActive,
    location: client.location || '',
    webSite: client.webSite || '',
    accountHolderName: client.accountHolderName || '',
    bankName: client.bankName || '',
    accountNumber: client.accountNumber || '',
    ifscCode: client.ifscCode || '',
    bankAddress: client.bankAddress || '',
    cancelledChequeCopy: client.cancelledChequeCopy || '',
    rejectReason: '',
    type: client.type,
    ffmcRegNo: client.ffmcRegNo || '',
    ffmcRegDate: formatDateForInput(client.ffmcRegDate),
  };

  return (
    <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
      <PartyProfileForm
        defaultValues={defaultValues}
        onSubmit={showReviewControls ? async () => undefined : handleSubmit}
        onCancel={handleCancel}
        onReviewSubmit={handleReviewSubmit}
        isSubmitting={isPending || isReviewing}
        disabled={showReviewControls ? true : !canModify}
        reviewMode={showReviewControls}
        submitLabel="Save Changes"
      />
    </section>
  );
};

export default PartyProfileEditView;
