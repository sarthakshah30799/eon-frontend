import { useController } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';
import { DatePicker } from '../../ui';
import { parseDateInput } from '@/utils';

interface FormFieldDatePickerProps {
  name: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  dateFormat?: string;
  minDate?: Date;
  maxDate?: Date;
}

const toDateString = (date: Date | null): string => {
  if (!date) {
    return '';
  }

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const FormFieldDatePicker = ({
  name,
  label,
  placeholder,
  disabled = false,
  className = '',
  dateFormat,
  minDate,
  maxDate,
}: FormFieldDatePickerProps) => {
  const form = useFormContext();

  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control: form.control,
  });
  const selectedDate = parseDateInput(String(field.value ?? ''));

  return (
    <DatePicker
      key={`${name}-${String(field.value ?? '')}`}
      label={label}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
      selected={selectedDate}
      onChange={date => {
        field.onChange(toDateString(date));
      }}
      error={error?.message}
      dateFormat={dateFormat}
      minDate={minDate}
      maxDate={maxDate}
      id={name}
    />
  );
};
