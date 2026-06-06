import { useFieldArray, useFormContext } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@/components/ui/button1';
import { CardSection } from '@/components/ui';
import { Form, FormFieldInput } from '@/components/forms';
import { additionalSettingsSchema } from '../schema';
import {
  createEmptyAdditionalSettingCategoryFormValues,
  createEmptyAdditionalSettingSubcategoryFormValues,
} from '../utils';
import type { IAdditionalSettingCategoryFormValues } from '../types';
import { ADDITIONAL_SETTINGS_TEXTS } from '../constants';

interface AdditionalSettingsCreateFormProps {
  defaultValues?: IAdditionalSettingCategoryFormValues;
  onSubmit: (values: IAdditionalSettingCategoryFormValues) => void | Promise<void>;
  isSubmitting?: boolean;
  submitLabel?: string;
}

const noTransformInputProps = {
  valueTransform: 'none' as const,
};

const SubcategoryFields = ({
  isSubmitting,
}: {
  isSubmitting: boolean;
}) => {
  const { control } = useFormContext<IAdditionalSettingCategoryFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'subcategories',
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-border-primary pb-3">
        <div>
          <p className="text-xs text-text-tertiary">
            Add linked subcategory definitions for this category.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isSubmitting}
          onClick={() => append(createEmptyAdditionalSettingSubcategoryFormValues())}
        >
          {fields.length === 0
            ? ADDITIONAL_SETTINGS_TEXTS.ADD_SUBCATEGORY
            : ADDITIONAL_SETTINGS_TEXTS.ADD_MORE}
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="rounded-sm border border-dashed border-border-primary bg-surface-primary p-4 text-sm text-text-tertiary">
          No subcategories yet. Use the button above to add the first one.
        </div>
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="relative rounded-sm border border-border-primary bg-surface-primary p-4"
            >
              {fields.length > 0 && (
                <button
                  type="button"
                  aria-label={`Remove subcategory ${index + 1}`}
                  className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border-primary bg-surface-primary text-text-tertiary transition hover:border-error-500 hover:bg-error-50 hover:text-error-600 disabled:opacity-50"
                  disabled={isSubmitting}
                  onClick={() => remove(index)}
                >
                  <svg
                    aria-hidden="true"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <FormFieldInput
                  name={`subcategories.${index}.title`}
                  label="Title"
                  placeholder="Enter subcategory title"
                  disabled={isSubmitting}
                  {...noTransformInputProps}
                />
                <FormFieldInput
                  name={`subcategories.${index}.code`}
                  label="Code"
                  placeholder="Enter subcategory code"
                  disabled={isSubmitting}
                  {...noTransformInputProps}
                />
                <FormFieldInput
                  name={`subcategories.${index}.value`}
                  label="Value"
                  placeholder="Enter subcategory value"
                  disabled={isSubmitting}
                  {...noTransformInputProps}
                />
                <FormFieldInput
                  name={`subcategories.${index}.categoryType`}
                  label="Category Type"
                  placeholder="Enter category type"
                  disabled={isSubmitting}
                  {...noTransformInputProps}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const AdditionalSettingsCreateForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  submitLabel = ADDITIONAL_SETTINGS_TEXTS.CREATE_CATEGORY,
}: AdditionalSettingsCreateFormProps) => {
  const initialValues =
    defaultValues ?? createEmptyAdditionalSettingCategoryFormValues();

  return (
    <Form
      onSubmit={onSubmit}
      resolver={yupResolver(additionalSettingsSchema)}
      defaultValues={initialValues}
      className="space-y-6"
    >
      <CardSection heading={ADDITIONAL_SETTINGS_TEXTS.CATEGORY_TITLE}>
        <div className="grid gap-4 md:grid-cols-2">
          <FormFieldInput
            name="title"
            label={ADDITIONAL_SETTINGS_TEXTS.CATEGORY_TITLE}
            placeholder="Enter category title"
            disabled={isSubmitting}
            {...noTransformInputProps}
          />
          <FormFieldInput
            name="code"
            label={ADDITIONAL_SETTINGS_TEXTS.CATEGORY_CODE}
            placeholder="Enter category code"
            disabled={isSubmitting}
            {...noTransformInputProps}
          />
        </div>
      </CardSection>

      <CardSection heading={ADDITIONAL_SETTINGS_TEXTS.SUBCATEGORIES}>
        <SubcategoryFields isSubmitting={isSubmitting} />
      </CardSection>

      <div className="flex justify-end border-t border-border-primary pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </Form>
  );
};

export default AdditionalSettingsCreateForm;
