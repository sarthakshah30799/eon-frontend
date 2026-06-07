import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button1';
import { Input } from '@/components/ui/input';
import { useDebounce, usePermission } from '@/hooks';
import { AccountProfileTable } from '../components';
import { useListAccountProfiles } from '../hooks';

export const AccountProfileListView = () => {
  const navigate = useNavigate();
  const { canAdd } = usePermission('/admin/accounts-profile');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  const query = useMemo(
    () => ({
      page,
      limit: pageSize,
      search: debouncedSearch.trim() || undefined,
    }),
    [page, pageSize, debouncedSearch]
  );

  const {
    data: accountResponse,
    isLoading,
    isFetching,
    error,
  } = useListAccountProfiles(query);
  const accounts = accountResponse?.data ?? [];
  const totalItems = accountResponse?.totalItems ?? 0;

  if (error) {
    return (
      <div className="py-6 text-center text-error-600">
        Failed to load account profiles. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        {canAdd && (
          <Button
            type="button"
            className="rounded-sm"
            onClick={() => navigate('/admin/accounts-profile/create')}
          >
            Create Account Profile
          </Button>
        )}
      </div>

      <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <Input
            label="Search"
            placeholder="Search account code, name, or division"
            value={search}
            onChange={event => {
              setPage(1);
              setSearch(event.target.value);
            }}
            className="sm:max-w-md"
          />
          <div className="text-sm text-text-secondary">
            {totalItems} total records
          </div>
        </div>

        <AccountProfileTable
          accounts={accounts}
          loading={isLoading || isFetching}
        />
      </section>
    </div>
  );
};
export default AccountProfileListView;
