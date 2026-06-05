import { useEffect, useState } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@/components/ui/button1';
import { Form, FormFieldInput, FormFieldSelect, FormFieldDatePicker, FormFieldTextarea } from '@/components/forms';
import { additionalSettingsSchema } from '../schema';
import {
  createEmptyAdditionalSettingCategoryFormValues,
  createEmptyAdditionalSettingSubcategoryFormValues,
} from '../utils';
import type { IAdditionalSettingCategoryFormValues } from '../types';
import { ADDITIONAL_SETTINGS_TEXTS } from '../constants';
import { useListValueTypes } from '../hooks';

interface AdditionalSettingsCreateFormProps {
  defaultValues?: IAdditionalSettingCategoryFormValues;
  onSubmit: (values: IAdditionalSettingCategoryFormValues) => void | Promise<void>;
  isSubmitting?: boolean;
  submitLabel?: string;
}

const formCardClass =
  'rounded-sm border border-border-primary bg-surface-secondary p-4';

const noTransformInputProps = {
  valueTransform: 'none' as const,
};

const SubcategoryRowFields = ({
  index,
  isSubmitting,
  loadTypeOptions,
  remove,
  fieldsLength,
}: {
  index: number;
  isSubmitting: boolean;
  loadTypeOptions: () => Promise<{ options: { value: string; label: string }[]; hasMore: boolean }>;
  remove: (index: number) => void;
  fieldsLength: number;
}) => {
  const { control, setValue } = useFormContext<IAdditionalSettingCategoryFormValues>();

  const categoryType = useWatch({
    control,
    name: `subcategories.${index}.categoryType`,
  });

  const isBooleanType = categoryType?.toLowerCase() === 'boolean';
  const isDateType = categoryType?.toLowerCase() === 'date';
  const isJsonType = categoryType?.toLowerCase() === 'json';
  const isNumberType = categoryType?.toLowerCase() === 'number' || categoryType?.toLowerCase() === 'decimal';

  const [prevType, setPrevType] = useState(categoryType);
  useEffect(() => {
    if (categoryType !== prevType) {
      setPrevType(categoryType);
      if (categoryType?.toLowerCase() === 'boolean') {
        setValue(`subcategories.${index}.value`, 'YES');
      } else {
        setValue(`subcategories.${index}.value`, '');
      }
    }
  }, [categoryType, prevType, index, setValue]);

  const loadBooleanOptions = async () => {
    return {
      options: [
        { value: 'YES', label: 'YES' },
        { value: 'NO', label: 'NO' },
      ],
      hasMore: false,
    };
  };

  return (
    <div className="relative rounded-sm border border-border-primary bg-surface-primary p-4">
      {fieldsLength > 0 && (
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
        <FormFieldSelect
          name={`subcategories.${index}.categoryType`}
          label="Category Type"
          placeholder="Select type"
          disabled={isSubmitting}
          loadOptions={loadTypeOptions}
        />

        {isBooleanType ? (
          <FormFieldSelect
            name={`subcategories.${index}.value`}
            label="Value"
            placeholder="Select YES or NO"
            disabled={isSubmitting}
            loadOptions={loadBooleanOptions}
          />
        ) : isDateType ? (
          <FormFieldDatePicker
            name={`subcategories.${index}.value`}
            label="Value"
            placeholder="Select date"
            disabled={isSubmitting}
          />
        ) : isJsonType ? (
          <FormFieldTextarea
            name={`subcategories.${index}.value`}
            label="Value (JSON)"
            placeholder="Enter JSON value"
            disabled={isSubmitting}
            rows={3}
          />
        ) : isNumberType ? (
          <FormFieldInput
            name={`subcategories.${index}.value`}
            label="Value"
            placeholder="Enter number value"
            type="number"
            disabled={isSubmitting}
            {...noTransformInputProps}
          />
        ) : (
          <FormFieldInput
            name={`subcategories.${index}.value`}
            label="Value"
            placeholder="Enter value"
            disabled={isSubmitting}
            {...noTransformInputProps}
          />
        )}
      </div>
    </div>
  );
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
  const { data: valueTypes = [] } = useListValueTypes();

  const loadTypeOptions = async () => {
    const options = valueTypes.map(t => ({ value: t, label: t.toUpperCase() }));
    return {
      options,
      hasMore: false,
    };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-border-primary pb-3">
        <div>
          <p className="text-sm font-semibold text-text-primary">
            {ADDITIONAL_SETTINGS_TEXTS.SUBCATEGORIES}
          </p>
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
            <SubcategoryRowFields
              key={field.id}
              index={index}
              isSubmitting={isSubmitting}
              loadTypeOptions={loadTypeOptions}
              remove={remove}
              fieldsLength={fields.length}
            />
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
  submitLabel = ADDITIONAL_SETTINGS_TEXTS.ADD_CATEGORY,
}: AdditionalSettingsCreateFormProps) => {
  const initialValues =
    defaultValues ?? createEmptyAdditionalSettingCategoryFormValues();

  return (
    <Form
      onSubmit={onSubmit}
      resolver={yupResolver(additionalSettingsSchema) as any}
      defaultValues={initialValues}
      className="space-y-6"
    >
      <section className={formCardClass}>
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
      </section>

      <section className={formCardClass}>
        <SubcategoryFields isSubmitting={isSubmitting} />
      </section>

      <div className="flex justify-end border-t border-border-primary pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </Form>
  );
};

export default AdditionalSettingsCreateForm;
