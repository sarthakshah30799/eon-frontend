import { useNavigate, useParams } from 'react-router-dom';
import { ProductProfileEditorView } from './ProductProfileEditorView';
import { useGetProductProfile, useUpdateProductProfile } from '../hooks';
import { PRODUCT_PROFILE_TEXTS } from '../constants';
import { mapRecordToFormValues } from '../utils';
import type { ICreateProductProfile } from '../types';
import { Loader } from '@/components/ui/loader';

export const ProductProfileEditView = () => {
  const navigate = useNavigate();
  const params = useParams();
  const id = params.id ?? '';
  const { data: productProfile, isLoading } = useGetProductProfile(id);
  const { submitProductProfile, isPending } = useUpdateProductProfile(id);

  if (isLoading) {
    return <Loader />;
  }

  if (!productProfile) {
    return (
      <div className="rounded-sm border border-border-primary bg-surface-primary p-6 shadow-sm">
        <p className="text-center text-text-secondary">Product not found</p>
      </div>
    );
  }

  const handleSubmit = async (values: ICreateProductProfile) => {
    await submitProductProfile(values);
    navigate('/admin/product-profile');
  };

  return (
    <div className="space-y-4 h-full!">
      <ProductProfileEditorView
        heading={PRODUCT_PROFILE_TEXTS.EDIT_PRODUCT}
        description="Update the product profile and accounting configuration."
        submitLabel={PRODUCT_PROFILE_TEXTS.SAVE_CHANGES}
        defaultValues={mapRecordToFormValues(productProfile)}
        onSubmitProduct={handleSubmit}
        isSubmitting={isPending}
      />
    </div>
  );
};

export default ProductProfileEditView;
