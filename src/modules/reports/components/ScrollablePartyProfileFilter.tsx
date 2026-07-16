import { useRef } from 'react';
import { Input, Checkbox } from '@/components/ui';
import type { IPartyProfile } from '@/modules/partyProfiles/types';
import type { IReportPartyProfileSelection } from '../types';

interface ScrollablePartyProfileFilterProps {
  profiles: IPartyProfile[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasMore: boolean;
  totalCount: number;
  search: string;
  onSearch: (value: string) => void;
  selection: IReportPartyProfileSelection;
  isSelected: (id: string) => boolean;
  onToggle: (id: string, checked: boolean) => void;
  onToggleAll: (checked: boolean) => void;
  onLoadMore: () => void;
  disabled?: boolean;
}

const buildPartyProfileLabel = (profile: IPartyProfile) => {
  const parts = [profile.code, profile.name].filter(Boolean);
  return parts.join(' - ') || profile.id;
};

export const ScrollablePartyProfileFilter = ({
  profiles,
  isLoading,
  isFetchingNextPage,
  hasMore,
  totalCount,
  search,
  onSearch,
  selection,
  isSelected,
  onToggle,
  onToggleAll,
  onLoadMore,
  disabled = false,
}: ScrollablePartyProfileFilterProps) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const selectedCount = selection.allSelected
    ? totalCount - selection.excludedIds.length
    : selection.selectedIds.length;

  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container || !hasMore || isFetchingNextPage || disabled) {
      return;
    }

    const threshold = 120;
    if (
      container.scrollTop + container.clientHeight >=
      container.scrollHeight - threshold
    ) {
      onLoadMore();
    }
  };

  return (
    <div className="space-y-1.5 rounded-md border border-slate-200 bg-white p-2 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
          Party Profiles
        </div>
        <span className="text-[10px] text-text-tertiary">{selectedCount} selected</span>
      </div>

      <div className="flex items-center gap-2">
        <Input
          label="Search"
          placeholder="Search code or name"
          value={search}
          onChange={event => onSearch(event.target.value)}
          classes={{ container: 'max-w-none flex-1' }}
        />
        <Checkbox
          checked={selection.allSelected}
          onChange={checked => onToggleAll(checked)}
          disabled={disabled}
          id="party-profile-select-all"
        >
          All
        </Checkbox>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="max-h-52 space-y-1 overflow-y-auto pr-1"
      >
        {isLoading ? (
          <div className="rounded-md border border-dashed border-slate-200 px-3 py-2 text-[11px] text-text-tertiary">
            Loading party profiles...
          </div>
        ) : profiles.length === 0 ? (
          <div className="rounded-md border border-dashed border-slate-200 px-3 py-2 text-[11px] text-text-tertiary">
            No party profiles found for the selected filters.
          </div>
        ) : (
          profiles.map(profile => (
            <label
              key={profile.id}
              className="flex cursor-pointer items-center justify-between gap-2 rounded-md border border-slate-100 bg-surface-primary px-2 py-1.5 transition hover:border-primary-200 hover:bg-primary-50/40"
            >
              <div className="min-w-0">
                <Checkbox
                  checked={isSelected(profile.id)}
                  onChange={checked => onToggle(profile.id, checked)}
                  disabled={disabled}
                  id={`party-profile-${profile.id}`}
                >
                  <span className="block truncate text-[11px] font-medium text-text-primary">
                    {buildPartyProfileLabel(profile)}
                  </span>
                </Checkbox>
                <span className="mt-0.5 block truncate text-[10px] text-text-tertiary">
                  {profile.type}
                  {profile.city ? ` • ${profile.city}` : ''}
                </span>
              </div>
            </label>
          ))
        )}
      </div>

      <div className="text-[10px] text-text-tertiary">
        {isFetchingNextPage ? 'Loading more profiles...' : hasMore ? 'Scroll to load more.' : 'All matching profiles loaded.'}
      </div>
    </div>
  );
};

export default ScrollablePartyProfileFilter;
