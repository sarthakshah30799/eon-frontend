import React, { forwardRef, useId } from 'react';
import ReactDatePicker from 'react-datepicker';
import { Label } from '../label';
import 'react-datepicker/dist/react-datepicker.css';
import './datepicker.css';

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
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    placeholder?: string;
  }
>(({ className = '', value, placeholder, ...props }, ref) => {
  const displayValue = String(value ?? '');
  const isEmpty = displayValue.trim().length === 0;

  return (
    <button
      ref={ref}
      type="button"
      className={`flex min-h-7.5 w-full items-center justify-between gap-3 rounded-md border border-border-secondary bg-surface-primary px-3 py-1 text-left text-sm text-text-primary shadow-none transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      <span className={`text-sm ${isEmpty ? 'text-text-tertiary' : 'text-text-primary'}`}>
        {isEmpty ? placeholder ?? 'Select date' : displayValue}
      </span>
      <svg
        aria-hidden="true"
        className="h-4 w-4 shrink-0 text-text-tertiary"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    </button>
  );
});

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
        customInput={<DatePickerInput />}
        showYearDropdown

      />
      {error && <p className="mt-1 text-sm text-error-600">{error}</p>}
    </div>
  );
};
