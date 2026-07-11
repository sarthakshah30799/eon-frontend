import { useNavigate, useSearchParams } from 'react-router-dom';
import { BulkDispatchView } from '@/modules/manual-bill-books/view/BulkDispatchView';

const ManualBillBookCreatePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reassignId = searchParams.get('reassignId') || undefined;

  const handleSuccess = () => {
    navigate('/manual-bill-books');
  };

  return (
    <BulkDispatchView onSuccess={handleSuccess} reassignId={reassignId} />
  );
};

export default ManualBillBookCreatePage;
