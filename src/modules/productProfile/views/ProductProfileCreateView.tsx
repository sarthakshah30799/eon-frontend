import { useNavigate } from 'react-router-dom';
import { ProductProfileEditorView } from './ProductProfileEditorView';
import { PRODUCT_PROFILE_TEXTS } from '../constants';
import { createEmptyProductProfileFormValues } from '../utils';
import { useCreateProductProfile } from '../hooks';
import type { ProductProfileFormValues } from '../types';

export const ProductProfileCreateView = () => {
  const navigate = useNavigate();
  const { submitProductProfile, isPending } = useCreateProductProfile();

  const handleSubmit = async (values: ProductProfileFormValues) => {
    await submitProductProfile(values);
    navigate('/master/system-setups/product-profile');
  };

  return (
    <ProductProfileEditorView
      heading={PRODUCT_PROFILE_TEXTS.CREATE_PRODUCT}
      description={PRODUCT_PROFILE_TEXTS.FORM_SUBTITLE}
      submitLabel={PRODUCT_PROFILE_TEXTS.CREATE_PRODUCT}
      defaultValues={createEmptyProductProfileFormValues()}
      onSubmitProduct={handleSubmit}
      isSubmitting={isPending}
    />
  );
};

export default ProductProfileCreateView;
