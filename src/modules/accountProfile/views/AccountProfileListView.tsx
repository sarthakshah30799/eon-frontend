import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button1';
import { useDebounce, useOffsetPaginatedList, usePermission } from '@/hooks';
import { PAGINATION_DEFAULTS } from '@/constants/paginationConstants';
import { accountProfileApi } from '@/api/accountProfile/accountProfile.api';
import { AccountProfileTable } from '../components';

export const AccountProfileListView = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { canAdd } = usePermission('/admin/accounts-profile');
  const search = searchParams.get('search') ?? '';
  const debouncedSearch = useDebounce(search, 400);

  const filters = useMemo(
    () => ({
      search: debouncedSearch.trim() || undefined,
    }),
    [debouncedSearch]
  );

  const {
    rows: accounts,
    isLoading,
    isFetching,
    error,
    page,
    limit,
    total,
    totalPages,
    handlePageChange,
    handlePageSizeChange,
  } = useOffsetPaginatedList({
    queryKey: ['account-profiles'],
    queryFn: params => accountProfileApi.getAccountProfiles(params),
    filters,
  });

  const handleSearch = (value: string) => {
    setSearchParams(prev => {
      const nextParams = new URLSearchParams(prev);
      if (value.trim()) {
        nextParams.set('search', value.trim());
      } else {
        nextParams.delete('search');
      }
      nextParams.set('offset', String(PAGINATION_DEFAULTS.OFFSET));
      if (!nextParams.get('limit')) {
        nextParams.set('limit', String(PAGINATION_DEFAULTS.LIMIT));
      }
      return nextParams;
    });
  };

  if (error) {
    return (
      <div className="py-6 text-center text-error-600">
        Failed to load account profiles. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-3">
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

      <section className="rounded-sm border border-border-primary bg-surface-primary p-3 shadow-sm">
        <AccountProfileTable
          accounts={accounts}
          loading={isLoading}
          isFetching={isFetching}
          onSearch={handleSearch}
          searchValue={search}
          searchPlaceholder="Search a/c code, a/c name, division/dept, a/c type, currency, or financial code"
          page={page}
          pageSize={limit}
          total={total}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </section>
    </div>
  );
};
export default AccountProfileListView;
