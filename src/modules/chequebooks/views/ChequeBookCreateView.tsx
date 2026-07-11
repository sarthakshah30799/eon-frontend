import { useNavigate, useSearchParams } from 'react-router-dom';
import { BulkDispatchForm } from '@/modules/chequebooks/BulkDispatchForm';

const ChequeBookCreateView = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reassignId = searchParams.get('reassignId') || undefined;

  const handleSuccess = () => {
    navigate('/cheque-books');
  };

  return (
    <div className="mx-auto w-full max-w-6xl rounded-md border border-border-primary bg-surface-primary p-5 shadow-sm">
      <BulkDispatchForm onSuccess={handleSuccess} reassignId={reassignId} />
    </div>
  );
};

export default ChequeBookCreateView;
