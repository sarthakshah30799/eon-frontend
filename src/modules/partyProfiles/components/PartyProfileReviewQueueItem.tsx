import { Button } from '@/components/ui';
import { formatDateTime } from '@/utils';
import type { IPartyProfile } from '../types';

interface PartyProfileReviewQueueItemProps {
  profile: IPartyProfile;
  onReviewProfile: (profile: IPartyProfile) => void;
}

export const PartyProfileReviewQueueItem = ({
  profile,
  onReviewProfile,
}: PartyProfileReviewQueueItemProps) => {
  return (
    <article className="flex flex-col gap-3 rounded-sm border border-border-primary bg-surface-secondary px-4 py-4 md:flex-row md:items-center md:justify-between">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-text-primary">{profile.code}</p>
          <span className="rounded-full bg-warning-100 px-2 py-0.5 text-xs font-medium text-warning-700">
            Pending
          </span>
        </div>
        <p className="text-sm text-text-secondary">{profile.name}</p>
        <p className="text-xs text-text-tertiary">
          Branch: {profile.branch?.name || 'Not assigned'} · Created:{' '}
          {formatDateTime(profile.createdAt, true)}
        </p>
      </div>

      <Button
        type="button"
        variant="outline"
        className="rounded-sm"
        onClick={() => onReviewProfile(profile)}
      >
        Review
      </Button>
    </article>
  );
};

export default PartyProfileReviewQueueItem;
