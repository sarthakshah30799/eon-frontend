import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { BulkDispatchView } from '@/modules/manual-bill-books/view/BulkDispatchView';
import { AccessDeniedState } from '@/components/ui/access-denied-state';
import { PAGE_STATUS_TEXTS } from '@/constants/commonConstants';
import { usePermission } from '@/hooks/usePermission';

const ManualBillBookCreatePage = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const reassignId = searchParams.get('reassignId') || undefined;
  const basePath = pathname.startsWith('/admin/')
    ? '/admin/manual-bill-books'
    : '/manual-bill-books';
  const { canAdd } = usePermission(basePath);

  const handleSuccess = () => {
    navigate(basePath);
  };

  if (!canAdd) {
    return (
      <AccessDeniedState message={PAGE_STATUS_TEXTS.ACCESS_DENIED_MESSAGE} />
    );
  }

  return <BulkDispatchView onSuccess={handleSuccess} reassignId={reassignId} />;
};

export default ManualBillBookCreatePage;
