import { useEffect, useState } from 'react';
import { useController } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';
import {
  AsyncSelect,
  type AsyncSelectOption,
  type AsyncSelectProps,
  type AsyncSelectResponse,
} from '../../ui';
import type { MultiValue, SingleValue } from 'react-select';

interface FormFieldSelectProps extends Omit<
  AsyncSelectProps<boolean>,
  'value' | 'onChange' | 'error'
> {
  name: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  isMulti?: boolean;
}

const flattenOptions = (
  response: AsyncSelectResponse | AsyncSelectOption[]
): AsyncSelectOption[] => {
  if (Array.isArray(response)) {
    return response;
  }

  return response.options;
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
  isMulti = false,
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

  const [selectedOption, setSelectedOption] = useState<
    AsyncSelectOption | readonly AsyncSelectOption[] | null
  >(null);

  useEffect(() => {
    let isActive = true;

    const resolveSelectedOption = async () => {
      if (isMulti) {
        const selectedValues = Array.isArray(field.value) ? field.value : [];

        if (selectedValues.length === 0) {
          if (isActive) {
            setSelectedOption([]);
          }
          return;
        }

        try {
          const response = await loadOptions('');
          const options = flattenOptions(response);
          const nextOptions = selectedValues
            .map(selectedValue =>
              options.find(
                option => String(option.value) === String(selectedValue)
              )
            )
            .filter((option): option is AsyncSelectOption => Boolean(option));

          if (isActive) {
            setSelectedOption(nextOptions);
          }
        } catch {
          if (isActive) {
            setSelectedOption([]);
          }
        }

        return;
      }

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
          options.find(option => String(option.value) === String(field.value)) ??
          null;

        if (isActive) {
          setSelectedOption(nextOption);
        }
      } catch {
        if (isActive) {
          setSelectedOption(null);
        }
      }
    };

    void resolveSelectedOption();

    return () => {
      isActive = false;
    };
  }, [field.value, isMulti, loadOptions]);

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
      value={selectedOption}
      isMulti={isMulti}
      closeMenuOnSelect={!isMulti}
      onChange={(
        option: MultiValue<AsyncSelectOption> | SingleValue<AsyncSelectOption>,
      ) => {
        if (isMulti) {
          const nextOptions = Array.isArray(option) ? option : [];
          setSelectedOption(nextOptions);
          field.onChange(
            nextOptions.map(selectedOptionItem => String(selectedOptionItem.value))
          );
          return;
        }

        if (Array.isArray(option) || option === null) {
          setSelectedOption(null);
          field.onChange(null);
          return;
        }

        const nextOption = option;
        setSelectedOption(nextOption);
        field.onChange(nextOption.value ?? null);
      }}
      error={error?.message}
    />
  );
};
