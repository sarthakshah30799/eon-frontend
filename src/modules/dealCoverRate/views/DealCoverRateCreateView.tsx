import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Loader } from '@/components/ui/loader';
import { useAuth } from '@/lib/AuthContext';
import { branchProfileApi } from '@/api/branchProfile';
import { DEAL_COVER_RATE_TEXT } from '../constants';
import { DealCoverRateForm } from '../forms';
import { useCreateDealCoverRate } from '../hooks';
import { emptyDealCoverForm, toDealCoverPayload } from '../utils';

export const DealCoverRateCreateView = () => {
  const navigate = useNavigate();
  const { user, activeBranchId } = useAuth();
  const createMutation = useCreateDealCoverRate();
  const canSelectBranch = Boolean(
    user?.isAdmin || user?.isHo || user?.isHoStaff
  );
  const { data: branches = [], isLoading } = useQuery({
    queryKey: ['branch-profiles-all', { activeOnly: true }],
    queryFn: () => branchProfileApi.getAllBranchProfiles({ activeOnly: true }),
  });
  const defaultBranch = useMemo(
    () =>
      canSelectBranch
        ? (branches.find(branch => branch.isHeadOffice) ?? branches[0])
        : branches.find(branch => branch.id === activeBranchId),
    [activeBranchId, branches, canSelectBranch]
  );
  const initialValues = useMemo(
    () => emptyDealCoverForm(defaultBranch?.id ?? activeBranchId ?? ''),
    [activeBranchId, defaultBranch?.id]
  );

  if (isLoading) return <Loader />;

  return (
    <DealCoverRateForm
      initialValues={initialValues}
      onSubmit={async values => {
        const created = await createMutation.mutateAsync(
          toDealCoverPayload(values)
        );
        toast.success(DEAL_COVER_RATE_TEXT.created);
        navigate(`/deal-cover-rate/edit/${created.id}`);
      }}
    />
  );
};

export default DealCoverRateCreateView;
