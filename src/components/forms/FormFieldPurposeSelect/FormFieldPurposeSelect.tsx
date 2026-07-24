import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { FormFieldSelect } from '../FormFieldSelect';
import { usePurposeOptions } from '@/hooks';
import type { TransactionType } from '@/modules/transactions';

interface FormFieldPurposeSelectProps {
  name: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  transactionType?: TransactionType | null;
}

export const FormFieldPurposeSelect = ({
  name,
  label = 'Purpose',
  placeholder = 'Select purpose',
  disabled = false,
  className,
  transactionType,
}: FormFieldPurposeSelectProps) => {
  const form = useFormContext();
  const purposeId = useWatch({
    control: form.control,
    name,
  });
  const { defaultOptions, loadOptions, isLoading } = usePurposeOptions(transactionType);

  useEffect(() => {
    if (!purposeId || isLoading) {
      return;
    }

    const normalizedPurposeId = String(purposeId);
    const exists = defaultOptions.some(option => String(option.value) === normalizedPurposeId);

    if (!exists) {
      form.setValue(name, '', {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    }
  }, [defaultOptions, form, isLoading, name, purposeId]);

  return (
    <FormFieldSelect
      name={name}
      label={label}
      placeholder={placeholder}
      className={className}
      loadOptions={loadOptions}
      defaultOptions={defaultOptions}
      isSearchable
      isCreatable={false}
      isLoading={isLoading || disabled}
      disabled={disabled}
    />
  );
};
