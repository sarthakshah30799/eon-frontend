import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button1';
import { useDebounce, usePermission } from '@/hooks';
import { FINANCIAL_CODE_TEXTS } from '../constants/financialCodeConstants';
import { FinancialCodeTable } from '../components/FinancialCodeTable';
import { useListFinancialCodes } from '../hooks/useListFinancialCodes';

export const FinancialCodeListView = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { canAdd } = usePermission('/financial-profile');
  const page = 1;
  const pageSize = 10;
  const search = searchParams.get('search') ?? '';
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
    data: listResponse,
    isLoading,
    isFetching,
    error,
  } = useListFinancialCodes(query);
  const financialCodes = listResponse?.data ?? [];

  if (error) {
    return (
      <div className="py-6 text-center text-error-600">
        {FINANCIAL_CODE_TEXTS.LIST_ERROR}
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
      <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
        <FinancialCodeTable
          financialCodes={financialCodes}
          loading={isLoading || isFetching}
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
          searchPlaceholder="Search financial type, code, name, or default sign"
        />
      </section>
    </div>
  );
};
export default FinancialCodeListView;
