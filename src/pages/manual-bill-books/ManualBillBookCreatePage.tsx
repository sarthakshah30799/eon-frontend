import { useNavigate } from 'react-router-dom';
import { BulkDispatchView } from '@/modules/manual-bill-books/view/BulkDispatchView';

const ManualBillBookCreatePage = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/manual-bill-books');
  };

  return (
    <BulkDispatchView onSuccess={handleSuccess} />
  );
};

export default ManualBillBookCreatePage;
