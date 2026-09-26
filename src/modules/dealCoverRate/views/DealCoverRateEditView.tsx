import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui';
import { Loader } from '@/components/ui/loader';
import { DealCoverStatus } from '@/api/dealCoverRate';
import { DEAL_COVER_RATE_TEXT } from '../constants';
import { DealCoverRateForm } from '../forms';
import {
  useCancelDealCoverRate,
  useDealCoverRate,
  useUpdateDealCoverRate,
} from '../hooks';
import { mapDealToForm, toDealCoverPayload } from '../utils';

export const DealCoverRateEditView = () => {
  const navigate = useNavigate();
  const { id = '' } = useParams();
  const query = useDealCoverRate(id);
  const updateMutation = useUpdateDealCoverRate();
  const cancelMutation = useCancelDealCoverRate();
  const deal = query.data;
  const isPending = deal?.status === DealCoverStatus.PENDING;

  if (query.isLoading) return <Loader />;
  if (query.error || !deal) {
    return (
      <div className="rounded border border-red-300 bg-red-50 p-4 text-sm text-red-700">
        {query.error instanceof Error
          ? query.error.message
          : DEAL_COVER_RATE_TEXT.notFound}
      </div>
    );
  }

  if (!isPending) {
    navigate(`/deal-cover-rate/view/${id}`, { replace: true });
    return <Loader />;
  }

  return (
    <DealCoverRateForm
      initialValues={mapDealToForm(deal)}
      submitLabel={DEAL_COVER_RATE_TEXT.update}
      onSubmit={async values => {
        await updateMutation.mutateAsync({
          id,
          payload: toDealCoverPayload(values),
        });
        toast.success(DEAL_COVER_RATE_TEXT.updated);
        navigate('/deal-cover-rate');
      }}
      footerActions={
        <Button
          type="button"
          variant="outline"
          loading={cancelMutation.isPending}
          disabled={updateMutation.isPending || cancelMutation.isPending}
          onClick={() => {
            if (!window.confirm(DEAL_COVER_RATE_TEXT.cancelConfirm)) return;
            void cancelMutation.mutateAsync(id).then(() => {
              toast.success(DEAL_COVER_RATE_TEXT.cancelled);
              navigate('/deal-cover-rate');
            });
          }}
        >
          {DEAL_COVER_RATE_TEXT.cancel}
        </Button>
      }
    />
  );
};

export default DealCoverRateEditView;
