import { useEffect, useState } from 'react';
import { useController } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';
import {
  AsyncSelect,
  Button,
  type AsyncSelectOption,
  type AsyncSelectProps,
  type AsyncSelectResponse,
} from '../../ui';
import type { MultiValue, SingleValue } from 'react-select';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface FormFieldSelectProps extends Omit<
  AsyncSelectProps<boolean>,
  'value' | 'onChange' | 'error' | 'onCreateOption'
> {
  name: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  isMulti?: boolean;
  displayValue?: string;
  onValueChange?: (value: string | string[] | null) => void;
  onCreateOption?: (
    inputValue: string
  ) =>
    | void
    | Promise<AsyncSelectOption | void | null>
    | AsyncSelectOption
    | null;
}

const flattenOptions = (
  response: AsyncSelectResponse | AsyncSelectOption[]
): AsyncSelectOption[] => {
  if (Array.isArray(response)) {
    return response;
  }

  return response.options;
};

const normalizeComparableValue = (value: unknown) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[_\s-]/g, '');

const getComparableOptionValues = (option: AsyncSelectOption) => [
  normalizeComparableValue(option.value),
  normalizeComparableValue(option.label),
];

const getComparableFieldValue = (value: unknown) => {
  if (value && typeof value === 'object' && 'value' in value) {
    return normalizeComparableValue((value as { value?: unknown }).value);
  }

  return normalizeComparableValue(value);
};

const isOptionArray = (
  value: AsyncSelectOption | readonly AsyncSelectOption[] | null
): value is readonly AsyncSelectOption[] => Array.isArray(value);

const optionsAreEqual = (
  current: AsyncSelectOption | readonly AsyncSelectOption[] | null,
  next: AsyncSelectOption | readonly AsyncSelectOption[] | null
) => {
  if (current === next) return true;
  if (isOptionArray(current) && isOptionArray(next)) {
    return (
      current.length === next.length &&
      current.every(
        (option, index) =>
          String(option.value) === String(next[index]?.value) &&
          option.label === next[index]?.label
      )
    );
  }
  if (!current || !next || isOptionArray(current) || isOptionArray(next)) {
    return false;
  }
  return (
    String(current.value) === String(next.value) && current.label === next.label
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
  isMulti = false,
  onValueChange,
  onCreateOption,
  isCreatable = false,
  isSearchable = true,
  defaultOptions,
  displayValue,
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

    const hasResolvedSingleOption = (value: unknown) =>
      Boolean(
        selectedOption &&
        !isOptionArray(selectedOption) &&
        getComparableOptionValues(selectedOption).includes(
          getComparableFieldValue(value)
        )
      );

    const hasResolvedMultiOptions = (selectedValues: unknown[]) => {
      if (
        !isOptionArray(selectedOption) ||
        selectedOption.length !== selectedValues.length
      ) {
        return false;
      }

      return selectedValues.every(selectedValue =>
        selectedOption.some(option =>
          getComparableOptionValues(option).includes(
            getComparableFieldValue(selectedValue)
          )
        )
      );
    };

    const resolveSelectedOption = async () => {
      if (isMulti) {
        const selectedValues = Array.isArray(field.value) ? field.value : [];

        if (selectedValues.length === 0) {
          if (isActive) {
            setSelectedOption(current =>
              optionsAreEqual(current, []) ? current : []
            );
          }
          return;
        }

        if (hasResolvedMultiOptions(selectedValues)) {
          return;
        }

        try {
          const response = await loadOptions('');
          const loadedOptions = flattenOptions(response);
          const options = Array.isArray(defaultOptions)
            ? [...defaultOptions, ...loadedOptions]
            : loadedOptions;
          const nextOptions = selectedValues
            .map(selectedValue =>
              options.find(option =>
                getComparableOptionValues(option).includes(
                  getComparableFieldValue(selectedValue)
                )
              )
            )
            .filter((option): option is AsyncSelectOption => Boolean(option));

          if (isActive) {
            const displayOptions =
              displayValue === 'code'
                ? nextOptions.map(opt => ({
                    ...opt,
                    label: opt.label.split('-')[0]?.trim() ?? opt.label,
                  }))
                : nextOptions;
            setSelectedOption(current =>
              optionsAreEqual(current, displayOptions)
                ? current
                : displayOptions
            );
          }
        } catch {
          if (isActive) {
            setSelectedOption(current =>
              optionsAreEqual(current, []) ? current : []
            );
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

      if (hasResolvedSingleOption(field.value)) {
        return;
      }

      try {
        const response = await loadOptions('');
        const loadedOptions = flattenOptions(response);
        const options = Array.isArray(defaultOptions)
          ? [...defaultOptions, ...loadedOptions]
          : loadedOptions;
        const nextOption =
          options.find(option =>
            getComparableOptionValues(option).includes(
              getComparableFieldValue(field.value)
            )
          ) ?? null;

        if (isActive) {
          const displayOption =
            nextOption && displayValue === 'code'
              ? {
                  ...nextOption,
                  label:
                    nextOption.label.split('-')[0]?.trim() ?? nextOption.label,
                }
              : nextOption;
          setSelectedOption(current =>
            optionsAreEqual(current, displayOption) ? current : displayOption
          );
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
  }, [defaultOptions, field.value, isMulti, loadOptions, selectedOption]);

  const handleCreateOption = async (inputValue: string) => {
    if (!onCreateOption) {
      return;
    }

    let createdOption: Awaited<ReturnType<typeof onCreateOption>>;

    try {
      createdOption = await onCreateOption(inputValue);
    } catch (error) {
      console.error('Failed to create select option:', error);
      return;
    }

    if (!createdOption) {
      return;
    }

    if (isMulti) {
      const currentValues = Array.isArray(field.value) ? field.value : [];
      const nextValue = String(createdOption.value);
      const nextValues = currentValues.includes(nextValue)
        ? currentValues
        : [...currentValues, nextValue];
      setSelectedOption(prevOptions => {
        const existingOptions = Array.isArray(prevOptions) ? prevOptions : [];

        return existingOptions.some(
          option => String(option.value) === String(createdOption.value)
        )
          ? existingOptions
          : [...existingOptions, createdOption];
      });
      field.onChange(nextValues);
      return;
    }

    setSelectedOption(createdOption);
    field.onChange(createdOption.value);
  };

  const selectedMultiOptions = Array.isArray(selectedOption)
    ? selectedOption
    : [];

  const handleRemoveMultiOption = (optionValue: string | number) => {
    if (!isMulti) {
      return;
    }

    const nextOptions = selectedMultiOptions.filter(
      option => String(option.value) !== String(optionValue)
    );

    setSelectedOption(nextOptions);
    field.onChange(nextOptions.map(option => option.value));
  };

  return (
    <div className="space-y-2">
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
        isCreatable={isCreatable}
        isSearchable={isSearchable}
        defaultOptions={defaultOptions}
        {...props}
        value={selectedOption}
        isMulti={isMulti}
        closeMenuOnSelect={!isMulti}
        controlShouldRenderValue={!isMulti}
        onInputChange={(inputValue, meta) => {
          const nextInputValue = inputValue.toUpperCase();
          return props.onInputChange
            ? props.onInputChange(nextInputValue, meta)
            : nextInputValue;
        }}
        onChange={(
          option: MultiValue<AsyncSelectOption> | SingleValue<AsyncSelectOption>
        ) => {
          if (isMulti) {
            const nextOptions = Array.isArray(option) ? option : [];
            const displayNextOptions =
              displayValue === 'code'
                ? nextOptions.map(opt => ({
                    ...opt,
                    label: opt.label.split('-')[0]?.trim() ?? opt.label,
                  }))
                : nextOptions;
            setSelectedOption(displayNextOptions);
            const nextValues = nextOptions.map(
              selectedOptionItem => selectedOptionItem.value
            );
            field.onChange(nextValues);
            onValueChange?.(nextValues.map(String));
            return;
          }

          if (Array.isArray(option) || option === null) {
            setSelectedOption(null);
            field.onChange(null);
            onValueChange?.(null);
            return;
          }

          const nextOption = option as AsyncSelectOption;
          const displayNextOption =
            displayValue === 'code'
              ? {
                  ...nextOption,
                  label:
                    nextOption.label.split('-')[0]?.trim() ?? nextOption.label,
                }
              : nextOption;
          setSelectedOption(displayNextOption);
          const nextValue = (nextOption as AsyncSelectOption).value;
          field.onChange(nextValue);
          onValueChange?.(String(nextValue));
        }}
        onCreateOption={handleCreateOption}
        error={error?.message}
      />

      {isMulti && selectedMultiOptions.length > 0 && (
        <div className="max-h-40 w-full max-w-[350px] overflow-y-auto rounded-sm border border-border-secondary bg-surface-secondary p-2">
          <div className="flex flex-wrap gap-2">
            {selectedMultiOptions.map(option => (
              <div
                key={String(option.value)}
                className="inline-flex max-w-full items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700 shadow-sm"
              >
                <span className="max-w-[220px] truncate">{option.label}</span>
                <Button
                  type="button"
                  aria-label={`Remove ${option.label}`}
                  className="border-0! h-4! bg-transparent! text-black!"
                  onClick={() => handleRemoveMultiOption(option.value)}
                >
                  <XMarkIcon className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
