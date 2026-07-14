import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader } from '../loader';
import { Label } from '../label';

interface ToggleSwitchProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
}

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

export const ToggleSwitch = ({
  checked,
  onCheckedChange,
  label,
  description,
  disabled = false,
  loading = false,
  className = '',
  ...props
}: ToggleSwitchProps) => {
  const isBusy = disabled || loading;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-busy={loading || undefined}
      disabled={isBusy}
      className={cn(
        'inline-flex items-center gap-3 text-left transition disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      onClick={event => {
        event.stopPropagation();
        onCheckedChange(!checked);
      }}
      {...props}
      >
        <span
          className={cn(
            'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-border-primary transition',
            checked ? 'bg-primary-500' : 'bg-surface-secondary'
          )}
        >
          <span
            className={cn(
              'inline-block h-5 w-5 translate-x-0 rounded-full bg-surface-primary shadow-sm transition-transform',
              checked && 'translate-x-5'
            )}
          />
          {loading && (
            <span className="absolute inset-0 flex items-center justify-center">
              <Loader variant="spinner" size="sm" className="text-primary-600" />
            </span>
          )}
        </span>

      {(label || description) && (
        <span className="space-y-0.5">
          {label && (
            <Label className="cursor-pointer text-sm font-medium text-text-primary">
              {label}
            </Label>
          )}
          {description && (
            <span className="block text-xs text-text-tertiary">
              {description}
            </span>
          )}
        </span>
      )}
    </button>
  );
};

export default ToggleSwitch;
