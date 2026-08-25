import { AccessDeniedState } from '@/components/ui/access-denied-state';
import { PAGE_STATUS_TEXTS } from '@/constants';
import { useAuth } from '@/lib/AuthContext';
import { FLM2_DAILY_ET_SUMMARY_TEXT } from '../constants/flm2DailyEtSummaryConstants';

export const Flm2DailyEtSummaryView = () => {
  const { user } = useAuth();
  const canView = Boolean(user);

  if (!canView) {
    return <AccessDeniedState message={PAGE_STATUS_TEXTS.ACCESS_DENIED_MESSAGE} />;
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold tracking-tight text-text-primary">
          {FLM2_DAILY_ET_SUMMARY_TEXT.title}
        </h1>
        <p className="max-w-3xl text-[11px] text-text-secondary">
          {FLM2_DAILY_ET_SUMMARY_TEXT.description}
        </p>
      </div>

      <section className="rounded-xl border border-border-primary bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-text-primary">
          {FLM2_DAILY_ET_SUMMARY_TEXT.comingSoon}
        </h2>
        <p className="mt-2 max-w-2xl text-[11px] text-text-secondary">
          {FLM2_DAILY_ET_SUMMARY_TEXT.comingSoonMessage}
        </p>
      </section>
    </div>
  );
};

export default Flm2DailyEtSummaryView;
