import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui';
import { Loader } from '@/components/ui/loader';
import { CardStockReceiptForm } from '../forms';
import { CARD_STOCK_PRINT_TEXT } from '../constants/cardStockConstants';
import { useGetCardStockReceipt, usePrintCardStockReceipt } from '../hooks';
import { getCardStockPrintButtonLabel, getCardStockPrintCopyType } from '../utils/cardStockPrintUtils';
import { mapReceiptToForm } from '../utils/cardStockUtils';

export const CardStockEditView = () => {
  const navigate = useNavigate();
  const { id = '' } = useParams<{ id: string }>();
  const { data, isLoading, error } = useGetCardStockReceipt(id);
  const { printReceipt, isPrinting } = usePrintCardStockReceipt();
  if (isLoading) return <Loader />;
  if (error || !data) return <div className="py-8 text-center text-error-600">{error instanceof Error ? error.message : 'Card stock receipt not found'}</div>;
  const copyType = getCardStockPrintCopyType(data.printCount);
  return (
    <CardStockReceiptForm
      initialValues={mapReceiptToForm(data)}
      readOnly
      onSubmit={() => navigate('/card-stock')}
      footerActions={
        <Button
          type="button"
          onClick={() => void printReceipt(data)}
          disabled={isPrinting}
        >
          {isPrinting ? CARD_STOCK_PRINT_TEXT.preparing : getCardStockPrintButtonLabel('STOCK_IN', copyType)}
        </Button>
      }
    />
  );
};

export default CardStockEditView;
