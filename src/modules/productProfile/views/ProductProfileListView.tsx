import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button1';
import { useDebounce, useOffsetPaginatedList, usePermission } from '@/hooks';
import { PAGINATION_DEFAULTS } from '@/constants/paginationConstants';
import { productProfileApi } from '@/api/productProfile';
import { PRODUCT_PROFILE_TEXTS } from '../constants';
import { ProductProfileTable } from '../components';
import { useUpdateProductProfileStatus } from '../hooks';

export const ProductProfileListView = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { canAdd } = usePermission('/admin/product-profile');
  const search = searchParams.get('search') ?? '';
  const debouncedSearch = useDebounce(search, 400);
  const filters = useMemo(
    () => ({
      search: debouncedSearch.trim() || undefined,
      activeOnly: false as const,
    }),
    [debouncedSearch]
  );
  const {
    rows: products,
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
    queryKey: ['product-profiles'],
    queryFn: params => productProfileApi.getProductProfiles(params),
    filters,
  });
  const { updateProductProfileStatus, isPending: isUpdatingStatus } =
    useUpdateProductProfileStatus();

  const handleToggleStatus = async (id: string, isActiveProduct: boolean) => {
    await updateProductProfileStatus({ id, isActiveProduct });
  };

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
        {PRODUCT_PROFILE_TEXTS.LIST_ERROR}
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
            onClick={() => navigate('/admin/product-profile/create')}
          >
            {PRODUCT_PROFILE_TEXTS.CREATE_PRODUCT}
          </Button>
        )}
      </div>

      <section className="rounded-sm border border-border-primary bg-surface-primary p-3 shadow-sm">
        <ProductProfileTable
          products={products}
          onToggleStatus={handleToggleStatus}
          isUpdatingStatus={isUpdatingStatus}
          loading={isLoading}
          isFetching={isFetching}
          onSearch={handleSearch}
          searchValue={search}
          searchPlaceholder="Search product code, description, retail, or bulk fee"
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

export default ProductProfileListView;
