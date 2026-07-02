import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button1';
import { useDebounce } from '@/hooks';
import { useListMiscellaneousProfiles } from '../hooks';
import { CATEGORY_OPTIONS_TEXTS } from '../constants';
import { MiscellaneousProfileTable } from '../components';

export const MiscellaneousProfileListView = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') ?? '';
  const debouncedSearch = useDebounce(search, 400);
  const query = useMemo(
    () => debouncedSearch.trim(),
    [debouncedSearch]
  );
  const { data: options = [], isLoading, isFetching, error } =
    useListMiscellaneousProfiles(query);

  if (error) {
    return (
      <div className="py-6 text-center text-error-600">
        Failed to load miscellaneous profiles.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          type="button"
          className="rounded-sm"
          onClick={() => navigate('/admin/miscellaneous-profile/create')}
        >
          {CATEGORY_OPTIONS_TEXTS.CREATE_TITLE}
        </Button>
      </div>

      <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm">
        <MiscellaneousProfileTable
          options={options}
          onSearch={value =>
            setSearchParams(prev => {
              const nextParams = new URLSearchParams(prev);

              if (value.trim()) {
                nextParams.set('search', value.trim());
              } else {
                nextParams.delete('search');
              }

              return nextParams;
            })
          }
          searchValue={search}
          searchPlaceholder="Search code"
          loading={isLoading || isFetching}
        />
      </section>
    </div>
  );
};

export default MiscellaneousProfileListView;
