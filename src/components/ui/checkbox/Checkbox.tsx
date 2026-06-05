import React from 'react';
import { Input } from '../input';
import { Label } from '../label';
import type { InputProps } from '../input';

interface CheckboxProps extends Omit<
  InputProps,
  'type' | 'onChange' | 'label' | 'error'
> {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  children?: React.ReactNode;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked = false,
  children,
  onChange,
  className,
  ...props
}) => {
  return (
    <div className={`flex items-center  ${className || ''}`}>
      <Input
        type="checkbox"
        checked={checked}
        onChange={e => onChange?.(e.target.checked)}
        className="h-4 w-4 rounded-md border-border-secondary text-primary-600 shadow-none focus:ring-primary-500"
        {...props}
      />
      {children && props.id && (
        <Label
          htmlFor={props.id}
          className="ml-2 block text-sm text-text-primary"
        >
          {children}
        </Label>
      )}
    </div>
  );
};
