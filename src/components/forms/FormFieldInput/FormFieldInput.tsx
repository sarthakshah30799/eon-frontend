import { useEffect, useRef, type ChangeEvent, type FocusEvent } from 'react';
import { useController } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';
import { Input, type InputProps } from '../../ui';
import { useDebounce } from '@/hooks';

export interface FormFieldInputProps extends InputProps {
  name: string;
  label?: string;
  valueTransform?: 'uppercase' | 'none';
  asyncValidation?: {
    enabled?: boolean;
    delay?: number;
    dependencies?: readonly unknown[];
    normalize?: (value: string) => string;
    check: (value: string) => Promise<boolean> | boolean;
    message: string;
  };
}

export const FormFieldInput = ({
  name,
  label,
  placeholder,
  type = 'text',
  disabled = false,
  className = '',
  valueTransform = 'uppercase',
  asyncValidation,
  value: valueProp,
  ...rest
}: FormFieldInputProps) => {
  const form = useFormContext();

  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control: form.control,
  });
  const validationEnabled = asyncValidation?.enabled ?? false;
  const validationDelay = asyncValidation?.delay ?? 400;
  const validationDependencies = asyncValidation?.dependencies ?? [];
  const validationNormalize = asyncValidation?.normalize;
  const validationCheck = asyncValidation?.check;
  const validationMessage = asyncValidation?.message ?? '';
  const debouncedValue = useDebounce(field.value, validationDelay);
  const validationRunIdRef = useRef(0);

  const validationErrorType = 'async-duplicate-check';

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    // Input already applies valueTransform; only sync RHF with the final value.
    field.onChange(event.target.value);
    rest.onChange?.(event);
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>): void => {
    field.onBlur();
    rest.onBlur?.(event);
  };

  useEffect(() => {
    if (!validationEnabled || !validationCheck) {
      return;
    }

    const normalizedValue =
      validationNormalize?.(String(debouncedValue ?? '')) ??
      String(debouncedValue ?? '').trim();
    const currentError = form.getFieldState(name).error;

    if (!normalizedValue) {
      if (currentError?.type === validationErrorType) {
        form.clearErrors(name);
      }
      return;
    }

    const runId = ++validationRunIdRef.current;
    let isActive = true;

    const runValidation = async () => {
      try {
        const isDuplicate = await validationCheck(normalizedValue);

        if (!isActive || runId !== validationRunIdRef.current) {
          return;
        }

        if (isDuplicate) {
          form.setError(name, {
            type: validationErrorType,
            message: validationMessage,
          });
          return;
        }

        if (form.getFieldState(name).error?.type === validationErrorType) {
          form.clearErrors(name);
        }
      } catch (error) {
        console.error(`Async validation failed for field "${name}":`, error);
      }
    };

    void runValidation();

    return () => {
      isActive = false;
    };
  }, [
    debouncedValue,
    form,
    name,
    validationCheck,
    validationEnabled,
    validationMessage,
    validationNormalize,
    ...validationDependencies,
  ]);

  return (
    <Input
      label={label}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
      {...field}
      {...rest}
      type={type}
      onChange={handleChange}
      onBlur={handleBlur}
      error={error?.message}
      valueTransform={valueTransform}
      value={valueProp !== undefined ? valueProp : field.value}
    />
  );
};
