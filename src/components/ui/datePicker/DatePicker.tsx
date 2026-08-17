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
  toDisplayDate,
} from '@/utils';

export interface DatePickerProps {
  label?: string;
  error?: string;
  selected?: Date | null;
  onChange?: (date: Date | null) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  dateFormat?: string;
  minDate?: Date;
  maxDate?: Date;
  id?: string;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
}

const DatePickerInput = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    placeholder?: string;
    onParsedDateChange?: (date: Date | null) => void;
    onDateBlur?: () => void;
    onInputKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
  }
>((({ className = '', value, placeholder, onParsedDateChange, onDateBlur, onInputKeyDown, ...props }, ref) => {
  const [typedValue, setTypedValue] = useState<string | null>(null);
  const displayValue = typedValue ?? toDisplayDate(value);

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    setTypedValue(null);
    props.onBlur?.(event);
    onDateBlur?.();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    onInputKeyDown?.(event);
    if (event.defaultPrevented) {
      return;
    }
    props.onKeyDown?.(event);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = maskDateInput(event.target.value);
    setTypedValue(nextValue);

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
        {...props}
        ref={ref}
        type="text"
        inputMode="numeric"
        className={`min-h-7.5 w-full rounded-md border border-border-secondary bg-surface-primary pl-3 pr-10 py-1 text-left text-sm text-text-primary shadow-none transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        value={displayValue}
        placeholder={placeholder}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
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
  onBlur,
  placeholder = 'Select date',
  disabled = false,
  className = '',
  dateFormat = 'dd/MM/yyyy',
  minDate,
  maxDate,
  id,
  onKeyDown,
}: DatePickerProps) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const selectedKey = selected ? formatDateDisplayInput(selected) : 'empty';

  const handleDateChange = (date: Date | null) => {
    onChange?.(date);
    onBlur?.();
  };

  return (
    <div className="space-y-1 max-w-[350px]">
      {label && <Label htmlFor={inputId}>{label}</Label>}
      <ReactDatePicker
        id={inputId}
        selected={selected}
        onChange={handleDateChange}
        disabled={disabled}
        placeholderText={placeholder}
        dateFormat={dateFormat}
        minDate={minDate}
        maxDate={maxDate}
        className={className}
        key={`${inputId}-${selectedKey}`}
        customInput={
          <DatePickerInput
            key={selectedKey}
            onParsedDateChange={handleDateChange}
            onBlur={onBlur}
            onDateBlur={onBlur}
            onInputKeyDown={onKeyDown}
          />
        }
        showYearDropdown
      />
      {error && <p className="mt-1 text-sm text-error-600">{error}</p>}
    </div>
  );
};
