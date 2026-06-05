import { ProductProfileForm } from '../forms';
import type { ICreateProductProfile } from '../types';

interface ProductProfileEditorViewProps {
  heading: string;
  description: string;
  submitLabel: string;
  defaultValues: ICreateProductProfile;
  onSubmitProduct: (values: ICreateProductProfile) => void | Promise<void>;
  isSubmitting?: boolean;
}

export const ProductProfileEditorView = ({
  submitLabel,
  defaultValues,
  onSubmitProduct,
  isSubmitting = false,
}: ProductProfileEditorViewProps) => {
  return (
    <section className="mx-auto w-full max-w-6xl rounded-md border border-border-primary bg-surface-primary p-5 shadow-sm">
      <ProductProfileForm
        defaultValues={defaultValues}
        onSubmit={onSubmitProduct}
        submitLabel={submitLabel}
        isSubmitting={isSubmitting}
      />
    </section>
  );
};
