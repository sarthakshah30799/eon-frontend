import { useCallback, useEffect } from 'react';
import { useFormContext, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { CardSection } from '@/components/ui';
import { Form, FormFieldCheckbox, FormFieldInput } from '@/components/forms';
import {
  PRODUCT_PROFILE_ACCOUNTING_FIELDS,
  PRODUCT_PROFILE_DETAIL_CHECKBOXES,
} from '../constants';
import { productProfileSchema } from '../schema';
import type { ICreateProductProfile } from '../types';
import { useNavigate } from 'react-router-dom';
import { productProfileApi } from '@/api/productProfile';
import { normalizeCodeValue } from '@/utils';

interface ProductProfileFormProps {
  defaultValues: ICreateProductProfile;
  onSubmit: (values: ICreateProductProfile) => void | Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
  currentId?: string;
}

const RetailTransactionConfig = ({
  isSubmitting,
}: {
  isSubmitting: boolean;
}) => {
  const { watch, setValue } = useFormContext();

  const availableInRetailBuying = watch('availableInRetailBuying');
  const availableInRetailSelling = watch('availableInRetailSelling');
  const availableInBulkBuying = watch('availableInBulkBuying');
  const availableInBulkSelling = watch('availableInBulkSelling');

  const retailBuyingSeriesApplicable = watch('retailBuyingSeriesApplicable');
  const retailSellingSeriesApplicable = watch('retailSellingSeriesApplicable');
  const bulkBuyingSeriesApplicable = watch('bulkBuyingSeriesApplicable');
  const bulkSellingSeriesApplicable = watch('bulkSellingSeriesApplicable');

  useEffect(() => {
    if (!availableInRetailBuying) {
      setValue('retailBuyingSeriesApplicable', false);
    }
  }, [availableInRetailBuying, setValue]);

  useEffect(() => {
    if (!availableInRetailSelling) {
      setValue('retailSellingSeriesApplicable', false);
    }
  }, [availableInRetailSelling, setValue]);

  useEffect(() => {
    if (!availableInBulkBuying) {
      setValue('bulkBuyingSeriesApplicable', false);
    }
  }, [availableInBulkBuying, setValue]);

  useEffect(() => {
    if (!availableInBulkSelling) {
      setValue('bulkSellingSeriesApplicable', false);
    }
  }, [availableInBulkSelling, setValue]);

  return (
    <div className="space-y-6">
      {/* Availability cards with nested series toggles */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Retail Buying Card */}
        <div
          className={`rounded-md border p-4 flex flex-col justify-between h-36 transition-all duration-300 ${
            availableInRetailBuying
              ? 'border-primary-500 bg-surface-primary shadow-sm ring-1 ring-primary-500/20'
              : 'border-border-primary bg-surface-secondary/50 opacity-80'
          }`}
        >
          <FormFieldCheckbox
            name="availableInRetailBuying"
            label="Available in Retail Buying"
            disabled={isSubmitting}
          />
          {availableInRetailBuying ? (
            <div className="pt-2 border-t border-dashed border-border-secondary flex items-center justify-between">
              <span className="text-xs font-semibold text-text-secondary">
                Series Applicable
              </span>
              <div className="inline-flex rounded-full bg-surface-secondary p-0.5 border border-border-primary">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setValue('retailBuyingSeriesApplicable', true)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200 ${
                    retailBuyingSeriesApplicable
                      ? 'bg-primary-500! text-white shadow-sm'
                      : 'text-text-tertiary hover:text-text-secondary'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() =>
                    setValue('retailBuyingSeriesApplicable', false)
                  }
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200 ${
                    !retailBuyingSeriesApplicable
                      ? 'bg-neutral-500 text-white shadow-sm'
                      : 'text-text-tertiary hover:text-text-secondary'
                  }`}
                >
                  No
                </button>
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-text-tertiary italic leading-relaxed">
              Product cannot be bought in retail transactions. Check to enable
              series configurations.
            </p>
          )}
        </div>

        {/* Retail Selling Card */}
        <div
          className={`rounded-md border p-4 flex flex-col justify-between h-36 transition-all duration-300 ${
            availableInRetailSelling
              ? 'border-primary-500 bg-surface-primary shadow-sm ring-1 ring-primary-500/20'
              : 'border-border-primary bg-surface-secondary/50 opacity-80'
          }`}
        >
          <FormFieldCheckbox
            name="availableInRetailSelling"
            label="Available in Retail Selling"
            disabled={isSubmitting}
          />
          {availableInRetailSelling ? (
            <div className="pt-2 border-t border-dashed border-border-secondary flex items-center justify-between">
              <span className="text-xs font-semibold text-text-secondary">
                Series Applicable
              </span>
              <div className="inline-flex rounded-full bg-surface-secondary p-0.5 border border-border-primary">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() =>
                    setValue('retailSellingSeriesApplicable', true)
                  }
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200 ${
                    retailSellingSeriesApplicable
                      ? 'bg-primary-500 text-white shadow-sm'
                      : 'text-text-tertiary hover:text-text-secondary'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() =>
                    setValue('retailSellingSeriesApplicable', false)
                  }
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200 ${
                    !retailSellingSeriesApplicable
                      ? 'bg-neutral-500 text-white shadow-sm'
                      : 'text-text-tertiary hover:text-text-secondary'
                  }`}
                >
                  No
                </button>
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-text-tertiary italic leading-relaxed">
              Product cannot be sold in retail transactions. Check to enable
              series configurations.
            </p>
          )}
        </div>

        {/* Bulk Buying Card */}
        <div
          className={`rounded-md border p-4 flex flex-col justify-between h-36 transition-all duration-300 ${
            availableInBulkBuying
              ? 'border-primary-500 bg-surface-primary shadow-sm ring-1 ring-primary-500/20'
              : 'border-border-primary bg-surface-secondary/50 opacity-80'
          }`}
        >
          <FormFieldCheckbox
            name="availableInBulkBuying"
            label="Available in Bulk Buying"
            disabled={isSubmitting}
          />
          {availableInBulkBuying ? (
            <div className="pt-2 border-t border-dashed border-border-secondary flex items-center justify-between">
              <span className="text-xs font-semibold text-text-secondary">
                Series Applicable
              </span>
              <div className="inline-flex rounded-full bg-surface-secondary p-0.5 border border-border-primary">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setValue('bulkBuyingSeriesApplicable', true)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200 ${
                    bulkBuyingSeriesApplicable
                      ? 'bg-primary-500 text-white shadow-sm'
                      : 'text-text-tertiary hover:text-text-secondary'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setValue('bulkBuyingSeriesApplicable', false)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200 ${
                    !bulkBuyingSeriesApplicable
                      ? 'bg-neutral-500 text-white shadow-sm'
                      : 'text-text-tertiary hover:text-text-secondary'
                  }`}
                >
                  No
                </button>
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-text-tertiary italic leading-relaxed">
              Product cannot be bought in bulk transactions. Check to enable
              series configurations.
            </p>
          )}
        </div>

        {/* Bulk Selling Card */}
        <div
          className={`rounded-md border p-4 flex flex-col justify-between h-36 transition-all duration-300 ${
            availableInBulkSelling
              ? 'border-primary-500 bg-surface-primary shadow-sm ring-1 ring-primary-500/20'
              : 'border-border-primary bg-surface-secondary/50 opacity-80'
          }`}
        >
          <FormFieldCheckbox
            name="availableInBulkSelling"
            label="Available in Bulk Selling"
            disabled={isSubmitting}
          />
          {availableInBulkSelling ? (
            <div className="pt-2 border-t border-dashed border-border-secondary flex items-center justify-between">
              <span className="text-xs font-semibold text-text-secondary">
                Series Applicable
              </span>
              <div className="inline-flex rounded-full bg-surface-secondary p-0.5 border border-border-primary">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setValue('bulkSellingSeriesApplicable', true)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200 ${
                    bulkSellingSeriesApplicable
                      ? 'bg-primary-500! text-white shadow-sm'
                      : 'text-text-tertiary hover:text-text-secondary'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setValue('bulkSellingSeriesApplicable', false)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200 ${
                    !bulkSellingSeriesApplicable
                      ? 'bg-neutral-500 text-white shadow-sm'
                      : 'text-text-tertiary hover:text-text-secondary'
                  }`}
                >
                  No
                </button>
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-text-tertiary italic leading-relaxed">
              Product cannot be sold in bulk transactions. Check to enable
              series configurations.
            </p>
          )}
        </div>
      </div>

      {/* Remaining checkboxes */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-sm border border-border-primary bg-surface-primary p-3 hover:border-border-secondary transition-all">
          <FormFieldCheckbox
            name="allowProductCancellation"
            label="Allow Product Cancellation"
            disabled={isSubmitting}
          />
        </div>
        <div className="rounded-sm border border-border-primary bg-surface-primary p-3 hover:border-border-secondary transition-all">
          <FormFieldCheckbox
            name="maintainBlankStockOfProduct"
            label="Maintain Blank Stock of Product?"
            disabled={isSubmitting}
          />
        </div>
        <div className="rounded-sm border border-border-primary bg-surface-primary p-3 hover:border-border-secondary transition-all">
          <FormFieldCheckbox
            name="denominationApplicable"
            label="Denomination Applicable"
            disabled={isSubmitting}
          />
        </div>
        <div className="rounded-sm border border-border-primary bg-surface-primary p-3 hover:border-border-secondary transition-all">
          <FormFieldCheckbox
            name="allowAddOnLinking"
            label="Allow Add-On Linking"
            disabled={isSubmitting}
          />
        </div>
        <div className="rounded-sm border border-border-primary bg-surface-primary p-3 hover:border-border-secondary transition-all">
          <FormFieldCheckbox
            name="instrumentIssuingAuthorityRequired"
            label="Instrument Issuing Authority Required"
            disabled={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
};

export const ProductProfileForm = ({
  defaultValues,
  onSubmit,
  submitLabel = 'Create Product',
  isSubmitting = false,
  currentId,
}: ProductProfileFormProps) => {
  const navigate = useNavigate();
  const validateProductCode = useCallback(
    async (value: string) => {
      const normalizedCode = normalizeCodeValue(value);
      if (!normalizedCode) {
        return false;
      }

      const products = await productProfileApi.getProductProfiles();
      return products.some(
        product =>
          normalizeCodeValue(product.productCode) === normalizedCode &&
          product.id !== currentId
      );
    },
    [currentId]
  );

  const onCancel = () => {
    navigate('/admin/product-profile');
  };
  return (
    <Form
      id="product-profile-form"
      onSubmit={onSubmit}
      resolver={
        yupResolver(productProfileSchema) as Resolver<ICreateProductProfile>
      }
      defaultValues={defaultValues}
      className="space-y-6"
      footer={{
        submitLabel,
        onBackClick: () => {
          void onCancel?.();
        },
        onCancel,
      }}
    >
      <CardSection heading="Product Info">
        <div className="grid gap-4 md:grid-cols-2">
          <FormFieldInput
            name="productCode"
            label="Product Code"
            disabled={isSubmitting || Boolean(currentId)}
            maxLength={2}
            asyncValidation={{
              enabled: !isSubmitting,
              check: validateProductCode,
              message: 'Product code already exists',
              normalize: normalizeCodeValue,
            }}
          />
          <FormFieldInput
            name="productDescription"
            label="Product Description"
            disabled={isSubmitting}
          />
        </div>
      </CardSection>

      <CardSection heading="Accounting Configuration">
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
      </CardSection>

      <CardSection heading="Product Details">
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
      </CardSection>

      <CardSection heading="Configuration for Retails Transactions">
        <RetailTransactionConfig isSubmitting={isSubmitting} />
      </CardSection>
    </Form>
  );
};
