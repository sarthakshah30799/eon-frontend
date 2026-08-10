import { useNavigate, useParams } from 'react-router-dom';
import { Loader } from '@/components/ui/loader';
import { CardStockReceiptForm } from '../forms';
import { useGetCardStockReceipt } from '../hooks';
import { mapReceiptToForm } from '../utils/cardStockUtils';

export const CardStockEditView = () => {
  const navigate = useNavigate();
  const { id = '' } = useParams<{ id: string }>();
  const { data, isLoading, error } = useGetCardStockReceipt(id);
  if (isLoading) return <Loader />;
  if (error || !data) return <div className="py-8 text-center text-error-600">{error instanceof Error ? error.message : 'Card stock receipt not found'}</div>;
  return <CardStockReceiptForm initialValues={mapReceiptToForm(data)} readOnly onSubmit={() => navigate('/card-stock')} />;
};

export default CardStockEditView;
