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
  const { user, activeBranchId, activeCounterId } = useAuth();
  const { data: branches = [], isLoading } = useListBranchProfiles({ activeOnly: true });
  const { createReceipt } = useCreateCardStockReceipt();
  const hoBranch = useMemo(() => branches.find(branch => branch.isHeadOffice), [branches]);
  const initialValues = useMemo(() => emptyForm(hoBranch?.id ?? activeBranchId ?? '', activeCounterId ?? ''), [activeBranchId, activeCounterId, hoBranch?.id]);
  if (!user?.isAdmin && !user?.isHo && !user?.isHoStaff) return <div className="py-8 text-center text-error-600">Only HO/Admin users can create card stock receipts.</div>;
  if (isLoading) return <Loader />;
  return <CardStockReceiptForm initialValues={initialValues} onSubmit={async values => { await createReceipt(values); navigate('/card-stock'); }} />;
};

export default CardStockCreateView;
