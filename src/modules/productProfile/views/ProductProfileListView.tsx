import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button1';
import { Loader } from '@/components/ui/loader';
import { usePermission } from '@/hooks';
import { PRODUCT_PROFILE_TEXTS } from '../constants';
import { ProductProfileTable } from '../components';
import { useListProductProfiles, useUpdateProductProfileStatus } from '../hooks';

export const ProductProfileListView = () => {
  const navigate = useNavigate();
  const { canAdd } = usePermission('/master/system-setups/product-profile');
  const { data: products = [], isLoading, error } = useListProductProfiles();
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
              navigate('/master/system-setups/product-profile/create')
            }
          >
            {PRODUCT_PROFILE_TEXTS.CREATE_PRODUCT}
          </Button>
        )}
      </div>

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

export default ProductProfileListView;
