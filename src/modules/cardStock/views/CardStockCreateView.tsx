import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader } from '@/components/ui/loader';
import { useAuth } from '@/lib/AuthContext';
import { useListBranchProfiles } from '@/modules/branchProfile/hooks';
import { useCreateCardStockReceipt } from '../hooks';
import { CardStockReceiptForm } from '../forms';
import { emptyForm } from '../utils/cardStockUtils';

export const CardStockCreateView = () => {
  const navigate = useNavigate();
  const { user, activeBranchId } = useAuth();
  const { data: branches = [], isLoading } = useListBranchProfiles({
    activeOnly: true,
  });
  const { createReceipt } = useCreateCardStockReceipt();
  const canSelectBranch = Boolean(
    user?.isAdmin || user?.isHo || user?.isHoStaff
  );
  const defaultBranch = useMemo(
    () =>
      canSelectBranch
        ? (branches.find(branch => branch.isHeadOffice) ?? branches[0])
        : branches.find(branch => branch.id === activeBranchId),
    [activeBranchId, branches, canSelectBranch]
  );
  const initialValues = useMemo(
    () => emptyForm(defaultBranch?.id ?? activeBranchId ?? ''),
    [activeBranchId, defaultBranch?.id]
  );
  if (isLoading) return <Loader />;
  return (
    <CardStockReceiptForm
      initialValues={initialValues}
      onSubmit={async values => {
        const created = await createReceipt(values);
        navigate(`/card-stock/edit/${created.id}`);
      }}
    />
  );
};

export default CardStockCreateView;
