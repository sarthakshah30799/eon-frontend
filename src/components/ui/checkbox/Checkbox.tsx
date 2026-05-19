import React from 'react';
import { Input } from '../input1';
import { Label } from '../label';
import type { InputProps } from '../input1';

interface CheckboxProps extends Omit<InputProps, 'type' | 'onChange' | 'label' | 'error'> {
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
    <div className={`flex items-center ${className || ''}`}>
      <Input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        {...props}
      />
      {children && props.id && (
        <Label htmlFor={props.id} className="ml-2 block text-sm text-gray-900">
          {children}
        </Label>
      )}
    </div>
  );
};
