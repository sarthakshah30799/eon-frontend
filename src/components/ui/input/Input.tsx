import { forwardRef } from 'react';
import { Label } from '../label';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', type = 'text', label, error, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && <Label htmlFor={props.id}>{label}</Label>}
        <input
          type={type}
          className={`block w-full rounded-md border border-border-secondary bg-surface-primary px-3 py-2 text-text-primary shadow-sm placeholder:text-text-tertiary focus:border-primary-500 focus:ring-primary-500 ${error ? 'border-error-500' : ''} ${className}`}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-error-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
