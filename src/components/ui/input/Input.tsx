import { forwardRef } from 'react';
import { Label } from '../label';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  valueTransform?: 'uppercase' | 'none';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = '',
      type = 'text',
      label,
      error,
      valueTransform = 'uppercase',
      onChange,
      ...props
    },
    ref
  ) => {
    const shouldUppercaseValue = type !== 'email' && type !== 'password';

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

    return (
      <div className="space-y-1">
        {label && <Label htmlFor={props.id}>{label}</Label>}
        <input
          type={type}
          style={{ fontSize: '14px' }}
          className={`min-h-7.5 block w-full rounded-md border border-slate-400 bg-surface-primary px-3 py-1 text-[14px] text-text-primary shadow-none placeholder:text-text-tertiary focus:border-slate-500! focus:ring-slate-500 focus-visible:border-transparent! focus-visible:outline-slate-500 focus-visible:ring-1 ${error ? 'border-error-500' : ''} ${className}`}
          ref={ref}
          {...props}
          onChange={handleChange}
        />
        {error && <p className="mt-1 text-sm text-error-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
