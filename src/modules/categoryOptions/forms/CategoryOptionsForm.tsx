import type { SubmitErrorHandler } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@/components/ui/button1';
import {
  Form,
  FormFieldCheckbox,
  FormFieldInput,
  FormFieldSelect,
} from '@/components/forms';
import type { AsyncSelectResponse } from '@/components/ui';
import {
  CATEGORY_OPTION_CODE_OPTIONS,
  CATEGORY_OPTIONS_TEXTS,
  loadCategoryOptionCodeOptions,
} from '../constants';
import { categoryOptionsSchema } from '../schema';
import type { ICreateCategoryOption } from '@/types/categoryOptionTypes';

const loadCodes = async (): Promise<AsyncSelectResponse> => {
  return loadCategoryOptionCodeOptions();
};

interface CategoryOptionsFormProps {
  defaultValues: ICreateCategoryOption;
  onSubmit: (values: ICreateCategoryOption) => void | Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
}

export const CategoryOptionsForm = ({
  defaultValues,
  onSubmit,
  submitLabel = CATEGORY_OPTIONS_TEXTS.SAVE_CHANGES,
  isSubmitting = false,
}: CategoryOptionsFormProps) => {
  const handleSubmitErrors: SubmitErrorHandler<ICreateCategoryOption> = errors => {
    console.log('CategoryOptionsForm submit errors:', errors);
  };

  return (
    <Form
      onSubmit={onSubmit}
      onError={handleSubmitErrors}
      resolver={yupResolver(categoryOptionsSchema) as Resolver<ICreateCategoryOption>}
      defaultValues={defaultValues}
      className="space-y-6"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <FormFieldSelect
          name="code"
          label="Category Code"
          placeholder="Select category"
          loadOptions={loadCodes}
          defaultOptions={CATEGORY_OPTION_CODE_OPTIONS}
          disabled={isSubmitting}
          isSearchable={false}
        />
        <FormFieldInput
          name="sortOrder"
          label="Sort Order"
          type="number"
          disabled={isSubmitting}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormFieldInput
          name="value"
          label="Value"
          disabled={isSubmitting}
          placeholder="e.g. branch"
        />
        <FormFieldInput
          name="label"
          label="Label"
          disabled={isSubmitting}
          placeholder="e.g. Branch"
        />
      </div>

      <div className="rounded-sm border border-border-primary bg-surface-secondary p-4">
        <FormFieldCheckbox
          name="isActive"
          label="Is Active"
          disabled={isSubmitting}
        />
      </div>

      <div className="flex justify-end border-t border-border-primary pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </Form>
  );
};
