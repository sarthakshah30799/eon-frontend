import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button1';
import { useDebounce, usePermission } from '@/hooks';
import { AccountProfileTable } from '../components';
import { useListAccountProfiles } from '../hooks';

export const AccountProfileListView = () => {
  const navigate = useNavigate();
  const { canAdd } = usePermission('/admin/accounts-profile');
  const [page] = useState(1);
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
        <AccountProfileTable
          accounts={accounts}
          loading={isLoading || isFetching}
          onSearch={value => setSearch(value)}
          searchValue={search}
          searchPlaceholder="Search a/c code, a/c name, division/dept, a/c type, currency, or financial code"
        />
      </section>
    </div>
  );
};
export default AccountProfileListView;
