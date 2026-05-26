import { useEffect, useState } from 'react';
import { useController } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';
import {
  AsyncSelect,
  type AsyncSelectGroupOption,
  type AsyncSelectOption,
  type AsyncSelectProps,
  type AsyncSelectResponse,
} from '../../ui';

interface FormFieldSelectProps extends Omit<
  AsyncSelectProps,
  'value' | 'onChange' | 'error'
> {
  name: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const flattenOptions = (
  response: AsyncSelectResponse | AsyncSelectOption[]
): AsyncSelectOption[] => {
  if (Array.isArray(response)) {
    return response;
  }

  return response.options.flatMap(
    (item: AsyncSelectOption | AsyncSelectGroupOption) =>
      'options' in item ? item.options : [item]
  );
};

export const FormFieldSelect = ({
  name,
  label,
  placeholder,
  disabled = false,
  className = '',
  loadOptions,
  pagination = false,
  pageSize = 20,
  debounceDelay = 300,
  size,
  variant,
  ...props
}: FormFieldSelectProps) => {
  const form = useFormContext();

  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control: form.control,
  });

  const [selectedOption, setSelectedOption] =
    useState<AsyncSelectOption | null>(null);

  useEffect(() => {
    let isActive = true;

    const resolveSelectedOption = async () => {
      if (
        field.value === null ||
        field.value === undefined ||
        field.value === ''
      ) {
        if (isActive) {
          setSelectedOption(null);
        }
        return;
      }

      try {
        const response = await loadOptions('');
        const options = flattenOptions(response);
        const nextOption =
          options.find(
            option => String(option.value) === String(field.value)
          ) ?? null;

        if (isActive) {
          setSelectedOption(nextOption);
        }
      } catch {
        if (isActive) {
          setSelectedOption(null);
        }
      }
    };

    resolveSelectedOption();

    return () => {
      isActive = false;
    };
  }, [field.value, loadOptions]);

  return (
    <AsyncSelect
      label={label}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
      loadOptions={loadOptions}
      pagination={pagination}
      pageSize={pageSize}
      debounceDelay={debounceDelay}
      size={size}
      variant={variant}
      {...props}
      {...field}
      value={selectedOption}
      onChange={option => {
        setSelectedOption(option ?? null);
        field.onChange(option?.value ?? null);
      }}
      error={error?.message}
    />
  );
};
