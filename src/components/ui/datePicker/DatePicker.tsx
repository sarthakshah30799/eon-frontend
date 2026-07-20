import React, { forwardRef, useId, useState } from 'react';
import ReactDatePicker from 'react-datepicker';
import { Label } from '../label';
import { CalendarIcon } from '@/assets/icons';
import 'react-datepicker/dist/react-datepicker.css';
import './datepicker.css';
import {
  formatDateDisplayInput,
  maskDateInput,
  parseDateInput,
} from '@/utils';

export interface DatePickerProps {
  label?: string;
  error?: string;
  selected?: Date | null;
  onChange?: (date: Date | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  dateFormat?: string;
  minDate?: Date;
  maxDate?: Date;
  id?: string;
}

const DatePickerInput = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    placeholder?: string;
    inputValue?: string;
    onInputValueChange?: (value: string) => void;
    onParsedDateChange?: (date: Date | null) => void;
  }
>((({ className = '', value, placeholder, inputValue, onInputValueChange, onParsedDateChange, ...props }, ref) => {
  const displayValue = inputValue ?? String(value ?? '');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = maskDateInput(event.target.value);
    onInputValueChange?.(nextValue);

    if (!nextValue) {
      onParsedDateChange?.(null);
      return;
    }

    if (nextValue.length === 10) {
      const parsed = parseDateInput(nextValue);
      onParsedDateChange?.(parsed);
    }
  };

  return (
    <div className="relative flex items-center w-full">
      <input
        ref={ref}
        type="text"
        inputMode="numeric"
        className={`min-h-7.5 w-full rounded-md border border-border-secondary bg-surface-primary pl-3 pr-10 py-1 text-left text-sm text-text-primary shadow-none transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        value={displayValue}
        placeholder={placeholder}
        {...props}
        onChange={handleChange}
      />
      <span className="absolute right-3 flex items-center pointer-events-none text-slate-400">
        <CalendarIcon className="h-4 w-4" />
      </span>
    </div>
  );
}));

DatePickerInput.displayName = 'DatePickerInput';

export const DatePicker = ({
  label,
  error,
  selected,
  onChange,
  placeholder = 'Select date',
  disabled = false,
  className = '',
  dateFormat = 'dd/MM/yyyy',
  minDate,
  maxDate,
  id,
}: DatePickerProps) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [inputValue, setInputValue] = useState(
    () => (selected ? formatDateDisplayInput(selected) : '')
  );

  return (
    <div className="space-y-1 max-w-[350px]">
      {label && <Label htmlFor={inputId}>{label}</Label>}
      <ReactDatePicker
        id={inputId}
        selected={selected}
        onChange={(date: Date | null) => onChange?.(date)}
        disabled={disabled}
        placeholderText={placeholder}
        dateFormat={dateFormat}
        minDate={minDate}
        maxDate={maxDate}
        className={className}
        customInput={
          <DatePickerInput
            inputValue={inputValue}
            onInputValueChange={setInputValue}
            onParsedDateChange={onChange}
          />
        }
        showYearDropdown
      />
      {error && <p className="mt-1 text-sm text-error-600">{error}</p>}
    </div>
  );
};
