import { useNavigate } from 'react-router-dom';
import { BackButton } from '@/components/ui';
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
  heading,
  description,
  submitLabel,
  defaultValues,
  onSubmitProduct,
  isSubmitting = false,
}: ProductProfileEditorViewProps) => {
  const navigate = useNavigate();

  return (
    <section className="rounded-sm border border-border-primary bg-surface-primary p-6 shadow-sm">
      <div className="mb-6 space-y-4">
        <BackButton
          onClick={() => navigate('/master/system-setups/product-profile')}
          label="Back"
        />

        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-tertiary">
          System Setup
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-text-primary">
          {heading}
        </h1>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          {description}
        </p>
      </div>

      <ProductProfileForm
        defaultValues={defaultValues}
        onSubmit={onSubmitProduct}
        submitLabel={submitLabel}
        isSubmitting={isSubmitting}
      />
    </section>
  );
};
