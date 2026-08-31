import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button1';
import { useDebounce, useOffsetPaginatedList, usePermission } from '@/hooks';
import { PAGINATION_DEFAULTS } from '@/constants/paginationConstants';
import { financialCodesApi } from '@/api/financialCodes/financialCodes.api';
import { FINANCIAL_CODE_TEXTS } from '../constants/financialCodeConstants';
import { FinancialCodeTable } from '../components/FinancialCodeTable';

export const FinancialCodeListView = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { canAdd } = usePermission('/financial-profile');
  const search = searchParams.get('search') ?? '';
  const debouncedSearch = useDebounce(search, 400);
  const filters = useMemo(
    () => ({
      search: debouncedSearch.trim() || undefined,
    }),
    [debouncedSearch]
  );

  const {
    rows: financialCodes,
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
    queryKey: ['financial-codes'],
    queryFn: params => financialCodesApi.getFinancialCodes(params),
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
        {FINANCIAL_CODE_TEXTS.LIST_ERROR}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {canAdd && (
        <div className="flex justify-end">
          <Button
            type="button"
            onClick={() => navigate('/financial-profile/create')}
          >
            {FINANCIAL_CODE_TEXTS.CREATE_CODE}
          </Button>
        </div>
      )}
      <section className="rounded-sm border border-border-primary bg-surface-primary p-3 shadow-sm">
        <FinancialCodeTable
          financialCodes={financialCodes}
          loading={isLoading}
          isFetching={isFetching}
          page={page}
          pageSize={limit}
          total={total}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onSearch={handleSearch}
          searchValue={search}
          searchPlaceholder="Search financial type, code, name, or default sign"
        />
      </section>
    </div>
  );
};
export default FinancialCodeListView;
