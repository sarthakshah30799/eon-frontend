import { useNavigate } from 'react-router-dom';
import { ProductProfileEditorView } from './ProductProfileEditorView';
import { PRODUCT_PROFILE_TEXTS } from '../constants';
import { createEmptyProductProfileFormValues } from '../utils';
import { useCreateProductProfile } from '../hooks';
import type { ICreateProductProfile } from '../types';

export const ProductProfileCreateView = () => {
  const navigate = useNavigate();
  const { submitProductProfile, isPending } = useCreateProductProfile();

  const handleSubmit = async (values: ICreateProductProfile) => {
    await submitProductProfile(values);
    navigate('/admin/product-profile');
  };

  return (
    <div className="space-y-4 h-full!">
      <ProductProfileEditorView
        heading={PRODUCT_PROFILE_TEXTS.CREATE_PRODUCT}
        description={PRODUCT_PROFILE_TEXTS.FORM_SUBTITLE}
        submitLabel={PRODUCT_PROFILE_TEXTS.CREATE_PRODUCT}
        defaultValues={createEmptyProductProfileFormValues()}
        onSubmitProduct={handleSubmit}
        isSubmitting={isPending}
      />
    </div>
  );
};

export default ProductProfileCreateView;
