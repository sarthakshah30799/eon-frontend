import type { IPartyProfile } from '../types';
import { PartyProfileReviewQueueItem } from './PartyProfileReviewQueueItem';

interface PartyProfileReviewQueueProps {
  profiles: IPartyProfile[];
  isLoading?: boolean;
  emptyMessage?: string;
  heading?: string;
  subheading?: string;
  onReviewProfile: (profile: IPartyProfile) => void;
}

export const PartyProfileReviewQueue = ({
  profiles,
  isLoading = false,
  emptyMessage = 'No pending profiles are waiting for your review right now.',
  heading = 'Pending party profiles',
  subheading = 'Approval Queue',
  onReviewProfile,
}: PartyProfileReviewQueueProps) => {
  return (
    <section className="rounded-sm border border-border-primary bg-surface-primary p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-text-tertiary">
            {subheading}
          </p>
          <h3 className="text-lg font-semibold text-text-primary">{heading}</h3>
        </div>
        <p className="text-sm text-text-secondary">
          {isLoading ? 'Loading...' : `${profiles.length} item(s) pending`}
        </p>
      </div>

      <div className="mt-4 space-y-3">
        {!isLoading && profiles.length === 0 ? (
          <div className="rounded-sm border border-dashed border-border-primary bg-surface-secondary px-4 py-5 text-sm text-text-secondary">
            {emptyMessage}
          </div>
        ) : null}

        {profiles.map(profile => (
          <PartyProfileReviewQueueItem
            key={profile.id}
            profile={profile}
            onReviewProfile={onReviewProfile}
          />
        ))}
      </div>
    </section>
  );
};

export default PartyProfileReviewQueue;
