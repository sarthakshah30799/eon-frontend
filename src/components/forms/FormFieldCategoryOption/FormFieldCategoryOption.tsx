import { useCallback } from 'react';
import { FormFieldSelect } from '../FormFieldSelect';
import { useCategoryOptions } from '@/hooks';
import type { ComponentProps } from 'react';
import type { AsyncSelectOption } from '@/components/ui';
import type { CategoryOptionCode } from '@/types/categoryOptionTypes';

type FormFieldSelectProps = ComponentProps<typeof FormFieldSelect>;

interface FormFieldCategoryOptionProps
  extends Omit<
    FormFieldSelectProps,
    'loadOptions' | 'defaultOptions' | 'isCreatable' | 'isSearchable' | 'onCreateOption'
  > {
  code: CategoryOptionCode;
  createLabel?: string;
  isCreatable?: boolean;
  isSearchable?: boolean;
  onCreateTransform?: (
    inputValue: string
  ) => { value: string; label: string } | Promise<{ value: string; label: string }>;
}

export const FormFieldCategoryOption = ({
  code,
  createLabel = 'Create',
  isCreatable = true,
  isSearchable = true,
  onCreateTransform,
  ...props
}: FormFieldCategoryOptionProps) => {
  const { defaultOptions, loadOptions, createOption } = useCategoryOptions(code);

  const handleCreateOption = useCallback(
    async (inputValue: string): Promise<AsyncSelectOption | void> => {
      if (!isCreatable) {
        return;
      }

      if (onCreateTransform) {
        const transformed = await onCreateTransform(inputValue);
        return createOption(transformed.value, transformed.label);
      }

      return createOption(inputValue);
    },
    [createOption, isCreatable, onCreateTransform]
  );

  return (
    <FormFieldSelect
      {...props}
      loadOptions={loadOptions}
      defaultOptions={defaultOptions}
      isCreatable={isCreatable}
      isSearchable={isSearchable}
      onCreateOption={handleCreateOption}
      formatCreateLabel={inputValue => `${createLabel} "${inputValue}"`}
    />
  );
};
