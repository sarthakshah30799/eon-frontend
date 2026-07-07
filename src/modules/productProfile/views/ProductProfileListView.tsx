import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button1';
import { Loader } from '@/components/ui/loader';
import { usePermission } from '@/hooks';
import { useDebounce } from '@/hooks';
import { PRODUCT_PROFILE_TEXTS } from '../constants';
import { ProductProfileTable } from '../components';
import { useListProductProfiles, useUpdateProductProfileStatus } from '../hooks';

export const ProductProfileListView = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { canAdd } = usePermission('/admin/product-profile');
  const search = searchParams.get('search') ?? '';
  const debouncedSearch = useDebounce(search, 400);
  const query = useMemo(
    () => debouncedSearch.trim().toLowerCase(),
    [debouncedSearch]
  );
  const { data: products = [], isLoading, error } = useListProductProfiles(false);
  const filteredProducts = useMemo(
    () =>
      query
        ? products.filter(product =>
            [
              product.productCode,
              product.productDescription,
              product.retail,
              product.bulkFee,
            ]
              .filter(Boolean)
              .some(value =>
                value.toString().toLowerCase().includes(query)
              )
          )
        : products,
    [products, query]
  );
  const {
    updateProductProfileStatus,
    isPending: isUpdatingStatus,
  } = useUpdateProductProfileStatus();

  const handleToggleStatus = async (id: string, isActiveProduct: boolean) => {
    await updateProductProfileStatus({ id, isActiveProduct });
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="py-6 text-center text-error-600">
        {PRODUCT_PROFILE_TEXTS.LIST_ERROR}
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
            onClick={() =>
              navigate('/admin/product-profile/create')
            }
          >
            {PRODUCT_PROFILE_TEXTS.CREATE_PRODUCT}
          </Button>
        )}
      </div>

      <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
        <ProductProfileTable
          products={filteredProducts}
          onToggleStatus={handleToggleStatus}
          isUpdatingStatus={isUpdatingStatus}
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
          searchPlaceholder="Search product code, description, retail, or bulk fee"
        />
      </section>
    </div>
  );
};

export default ProductProfileListView;
