import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button1';
import { useListProductProfiles, useUpdateProductProfileStatus } from '../hooks';
import { PRODUCT_PROFILE_TEXTS } from '../constants';
import { ProductProfileTable } from '../components';
import { Loader } from '@/components/ui/loader';

export const ProductProfileListView = () => {
  const navigate = useNavigate();
  const { data: products = [], isLoading, error } = useListProductProfiles();
  const { updateProductProfileStatus, isPending: isUpdatingStatus } =
    useUpdateProductProfileStatus();

  const handleToggleStatus = async (id: string, isActiveProduct: boolean) => {
    await updateProductProfileStatus({ id, isActiveProduct });
  };

  if (isLoading) {
    return (
     <Loader />
    );
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
      <section className="rounded-sm border border-border-primary bg-surface-primary p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-tertiary">
              System Setup
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-text-primary">
              {PRODUCT_PROFILE_TEXTS.LIST_TITLE}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
              {PRODUCT_PROFILE_TEXTS.LIST_SUBTITLE}
            </p>
          </div>

          <Button
            type="button"
            className="rounded-sm"
            onClick={() =>
              navigate('/master/system-setups/product-profile/create')
            }
          >
            {PRODUCT_PROFILE_TEXTS.CREATE_PRODUCT}
          </Button>
        </div>
      </section>

      <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
        <ProductProfileTable
          products={products}
          onToggleStatus={handleToggleStatus}
          isUpdatingStatus={isUpdatingStatus}
        />
      </section>
    </div>
  );
};
