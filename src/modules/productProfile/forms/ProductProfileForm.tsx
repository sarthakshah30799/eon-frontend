import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@/components/ui/button1';
import { Form, FormFieldCheckbox, FormFieldInput } from '@/components/forms';
import {
  PRODUCT_PROFILE_ACCOUNTING_FIELDS,
  PRODUCT_PROFILE_DETAIL_CHECKBOXES,
  PRODUCT_PROFILE_RETAIL_TRANSACTION_CHECKBOXES,
} from '../constants';
import { productProfileSchema } from '../schema';
import type { ICreateProductProfile } from '../types';

interface ProductProfileFormProps {
  defaultValues: ICreateProductProfile;
  onSubmit: (values: ICreateProductProfile) => void | Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
}

const formCardClass =
  'rounded-sm border border-border-primary bg-surface-secondary p-4';

export const ProductProfileForm = ({
  defaultValues,
  onSubmit,
  submitLabel = 'Create Product',
  isSubmitting = false,
}: ProductProfileFormProps) => {
  return (
    <Form
      onSubmit={onSubmit}
      resolver={yupResolver(productProfileSchema)}
      defaultValues={defaultValues}
      className="space-y-6"
    >
      <section className={formCardClass}>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-text-tertiary">
          Product Info
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <FormFieldInput
            name="productCode"
            label="Product Code"
            disabled={isSubmitting}
          />
          <FormFieldInput
            name="productDescription"
            label="Product Description"
            disabled={isSubmitting}
          />
        </div>
      </section>

      <section className={formCardClass}>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-text-tertiary">
          Accounting Configuration
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {PRODUCT_PROFILE_ACCOUNTING_FIELDS.map(field => (
            <FormFieldInput
              key={field.name}
              name={field.name}
              label={field.label}
              type={field.inputType ?? 'text'}
              inputMode={field.inputType === 'number' ? 'decimal' : undefined}
              step={field.inputType === 'number' ? 'any' : undefined}
              disabled={isSubmitting}
            />
          ))}
        </div>
      </section>

      <section className={formCardClass}>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-text-tertiary">
          Product Details
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <FormFieldInput
            name="levelPriority"
            label="Level / Priority"
            disabled={isSubmitting}
          />
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {PRODUCT_PROFILE_DETAIL_CHECKBOXES.map(option => (
            <div
              key={option.name}
              className="rounded-sm border border-border-primary bg-surface-primary p-3"
            >
              <FormFieldCheckbox
                name={option.name}
                label={option.label}
                disabled={isSubmitting}
              />
            </div>
          ))}
        </div>
      </section>

      <section className={formCardClass}>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-text-tertiary">
          Configuration for Retails Transactions
        </h2>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {PRODUCT_PROFILE_RETAIL_TRANSACTION_CHECKBOXES.map(option => (
            <div
              key={option.name}
              className="rounded-sm border border-border-primary bg-surface-primary p-3"
            >
              <FormFieldCheckbox
                name={option.name}
                label={option.label}
                disabled={isSubmitting}
              />
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-end border-t border-border-primary pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </Form>
  );
};
