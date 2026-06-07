import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button1';
import { Input } from '@/components/ui/input';
import { useDebounce, usePermission } from '@/hooks';
import { FINANCIAL_CODE_TEXTS } from '../constants/financialCodeConstants';
import { FinancialCodeTable } from '../components/FinancialCodeTable';
import { useListFinancialCodes } from '../hooks/useListFinancialCodes';

export const FinancialCodeListView = () => {
  const navigate = useNavigate();
  const { canAdd } = usePermission('/admin/financial-profile');
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

  const { data: listResponse, isLoading, isFetching, error } = useListFinancialCodes(query);
  const financialCodes = listResponse?.data ?? [];
  const totalItems = listResponse?.totalItems ?? 0;

  if (error) {
    return (
      <div className="py-6 text-center text-error-600">
        {FINANCIAL_CODE_TEXTS.LIST_ERROR}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-sm border border-border-primary bg-surface-primary p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-tertiary">
              Admin Menu
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-text-primary">
              {FINANCIAL_CODE_TEXTS.LIST_TITLE}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
              {FINANCIAL_CODE_TEXTS.LIST_SUBTITLE}
            </p>
          </div>

          {canAdd && (
            <Button
              type="button"
              className="rounded-sm"
              onClick={() => navigate('/admin/financial-profile/create')}
            >
              {FINANCIAL_CODE_TEXTS.CREATE_CODE}
            </Button>
          )}
        </div>
      </section>

      <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <Input
            label="Search"
            placeholder="Search type, code, or name..."
            value={search}
            onChange={event => {
              setPage(1);
              setSearch(event.target.value);
            }}
            className="sm:max-w-md"
          />
          <div className="text-sm text-text-secondary">{totalItems} total records</div>
        </div>

        <FinancialCodeTable financialCodes={financialCodes} loading={isLoading || isFetching} />
      </section>
    </div>
  );
};
export default FinancialCodeListView;
