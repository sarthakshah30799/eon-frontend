import { useParams } from 'react-router-dom';
import { Loader } from '@/components/ui/loader';
import { DEAL_COVER_RATE_TEXT } from '../constants';
import { DealCoverRateForm } from '../forms';
import { useDealCoverRate } from '../hooks';
import { mapDealToForm } from '../utils';

export const DealCoverRateViewView = () => {
  const { id = '' } = useParams();
  const query = useDealCoverRate(id);

  if (query.isLoading) return <Loader />;
  if (query.error || !query.data) {
    return (
      <div className="rounded border border-red-300 bg-red-50 p-4 text-sm text-red-700">
        {query.error instanceof Error
          ? query.error.message
          : DEAL_COVER_RATE_TEXT.notFound}
      </div>
    );
  }

  return (
    <DealCoverRateForm
      initialValues={mapDealToForm(query.data)}
      readOnly
      onSubmit={() => undefined}
    />
  );
};

export default DealCoverRateViewView;
