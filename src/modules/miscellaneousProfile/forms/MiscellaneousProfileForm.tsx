import { useFieldArray, useFormContext } from 'react-hook-form';
import type { Resolver, SubmitErrorHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@/components/ui/button1';
import { Form } from '@/components/forms/Form';
import { FormFieldCheckbox } from '@/components/forms/FormFieldCheckbox';
import { FormFieldInput } from '@/components/forms/FormFieldInput';
import { FormFieldSelect } from '@/components/forms/FormFieldSelect';
import type { AsyncSelectResponse } from '@/components/ui';
import {
  CATEGORY_OPTION_CODE_OPTIONS,
  CATEGORY_OPTIONS_TEXTS,
  loadCategoryOptionCodeOptions,
} from '../constants';
import { miscellaneousProfileFormSchema } from '../schema';
import type {
  ICategoryOptionFormItemValues,
  ICategoryOptionsFormValues,
} from '../utils';
import { createEmptyCategoryOptionsFormValues } from '../utils';
import type { CategoryOptionCode } from '@/types/categoryOptionTypes';
import { useNavigate } from 'react-router-dom';

const loadCodes = async (): Promise<AsyncSelectResponse> => {
  return loadCategoryOptionCodeOptions();
};

interface MiscellaneousProfileFormProps {
  defaultValues: ICategoryOptionsFormValues;
  onSubmit: (values: ICategoryOptionsFormValues) => void | Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
  mode?: 'create' | 'edit';
  fixedCode?: CategoryOptionCode;
}

const CategoryOptionRows = ({
  mode,
  isSubmitting,
}: {
  mode: 'create' | 'edit';
  isSubmitting: boolean;
}) => {
  const form = useFormContext<ICategoryOptionsFormValues>();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-border-primary pb-3">
        <div>
          <p className="text-sm font-semibold text-text-primary">Options</p>
          <p className="text-xs text-text-tertiary">
            {mode === 'create'
              ? 'Add one or more values for this category.'
              : 'Update the selected category.'}
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isSubmitting}
          onClick={() =>
            append({
              value: '',
              label: '',
            } satisfies ICategoryOptionFormItemValues)
          }
        >
          Add more
        </Button>
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="relative rounded-sm border border-border-primary bg-surface-secondary p-4"
          >
            {(mode === 'create' && fields.length > 1) ||
            (mode === 'edit' && !field.id) ? (
              <button
                type="button"
                aria-label={`Remove option ${index + 1}`}
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
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
              <FormFieldInput
                name={`items.${index}.value`}
                label={`Value ${index + 1}`}
                placeholder="e.g. branch"
                valueTransform="none"
                disabled={isSubmitting}
              />
              <FormFieldInput
                name={`items.${index}.label`}
                label="Label"
                placeholder="Optional, defaults to value"
                valueTransform="none"
                disabled={isSubmitting}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const MiscellaneousProfileForm = ({
  defaultValues,
  onSubmit,
  submitLabel = CATEGORY_OPTIONS_TEXTS.SAVE_CHANGES,
  isSubmitting = false,
  mode = 'create',
  fixedCode,
}: MiscellaneousProfileFormProps) => {
  const navigate = useNavigate();
  const initialValues =
    defaultValues ?? createEmptyCategoryOptionsFormValues(fixedCode);

  const handleSubmitErrors: SubmitErrorHandler<
    ICategoryOptionsFormValues
  > = errors => {
    console.log('MiscellaneousProfileForm submit errors:', errors);
  };
  const onCancel = () => {
    navigate('/admin/miscellaneous-profile');
  };

  return (
    <Form
      id={'miscellaneous-profile-form'}
      onSubmit={onSubmit}
      onError={handleSubmitErrors}
      resolver={
        yupResolver(
          miscellaneousProfileFormSchema
        ) as Resolver<ICategoryOptionsFormValues>
      }
      defaultValues={{
        ...initialValues,
        code: fixedCode ?? initialValues.code,
        items:
          initialValues.items.length > 0
            ? initialValues.items
            : [{ value: '', label: '' }],
      }}
      className="space-y-6"
      footer={{
        submitLabel,
        backLabel: 'Back',
        onBackClick: () => {
          void onCancel?.();
        },
        onCancel,
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        {fixedCode ? (
          <div className="rounded-sm border border-border-primary bg-surface-secondary p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-text-tertiary">
              Category Code
            </p>
            <p className="mt-2 text-sm font-medium text-text-primary">
              {CATEGORY_OPTION_CODE_OPTIONS.find(
                option => option.value === fixedCode
              )?.label ?? fixedCode}
            </p>
          </div>
        ) : (
          <FormFieldSelect
            name="code"
            label="Category Code"
            placeholder="Select category"
            loadOptions={loadCodes}
            defaultOptions={CATEGORY_OPTION_CODE_OPTIONS}
            disabled={isSubmitting}
            isSearchable={false}
          />
        )}

        <FormFieldInput
          name="sortOrder"
          label="Sort Order"
          type="number"
          disabled={isSubmitting}
        />
      </div>

      <CategoryOptionRows mode={mode} isSubmitting={isSubmitting} />

      <div className="rounded-sm border border-border-primary bg-surface-secondary p-4">
        <FormFieldCheckbox
          name="isActive"
          label="Is Active"
          disabled={isSubmitting}
        />
      </div>
    </Form>
  );
};
