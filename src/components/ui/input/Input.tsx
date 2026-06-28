import { forwardRef } from 'react';
import { Label } from '../label';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  classes?: {
    container?: string;
    input?: string;
    label?: string;
  };
  valueTransform?: 'uppercase' | 'none';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = '',
      type = 'text',
      label,
      error,
      classes,
      valueTransform = 'uppercase',
      onChange,
      onInput,
      ...props
    },
    ref
  ) => {
    const shouldUppercaseValue = type !== 'email' && type !== 'password';
    const resolvedInputMode =
      props.inputMode ?? (type === 'number' ? 'decimal' : undefined);
    const isNumericNumberInput =
      type === 'number' && resolvedInputMode === 'numeric';
    const isDecimalNumberInput =
      type === 'number' && resolvedInputMode === 'decimal';
    const resolvedType = isDecimalNumberInput ? 'text' : type;
    const resolvedStep =
      isDecimalNumberInput && props.step === undefined ? 'any' : props.step;

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextValue =
        valueTransform === 'uppercase' && shouldUppercaseValue
          ? event.target.value.toUpperCase()
          : event.target.value;

      const transformedEvent = {
        ...event,
        target: {
          ...event.target,
          value: nextValue,
        },
        currentTarget: {
          ...event.currentTarget,
          value: nextValue,
        },
      } as React.ChangeEvent<HTMLInputElement>;

      onChange?.(transformedEvent);
    };

    const handleInput = (event: React.FormEvent<HTMLInputElement>) => {
      if (isNumericNumberInput) {
        event.currentTarget.value = event.currentTarget.value.replace(
          /[^0-9]/g,
          ''
        );
      }

      if (isDecimalNumberInput) {
        const nextValue = event.currentTarget.value;
        const cleanedValue = nextValue
          .replace(/[^0-9.]/g, '')
          .replace(/(\..*)\./g, '$1');

        event.currentTarget.value = cleanedValue;
      }

      onInput?.(event as any);
    };

    return (
      <div className={`space-y-1 max-w-[350px] ${classes?.container}`}>
        {label && (
          <Label htmlFor={props.id} className={classes?.label}>
            {label}
          </Label>
        )}
        <input
          type={resolvedType}
          step={resolvedStep}
          inputMode={resolvedInputMode}
          style={{ fontSize: '14px' }}
          className={`min-h-7.5 block w-full rounded-md border border-slate-400 bg-surface-primary px-3 py-1 text-[14px] text-text-primary shadow-none placeholder:text-text-tertiary focus:border-slate-500! focus:ring-slate-500 focus-visible:border-transparent! focus-visible:outline-slate-500 focus-visible:ring-1 disabled:cursor-not-allowed! disabled:opacity-50 disabled:bg-slate-100 disabled:text-text-tertiary ${error ? 'border-error-500' : ''} ${classes?.input} ${className}`}
          ref={ref}
          {...props}
          onChange={handleChange}
          onInput={handleInput}
        />
        {error && <p className="mt-1 text-sm text-error-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
