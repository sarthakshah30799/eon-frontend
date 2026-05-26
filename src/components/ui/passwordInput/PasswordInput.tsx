import React, { useState } from 'react';
import { Input } from '../input';
import { Button } from '../button1';
import { EyeIcon, EyeSlashIcon } from '../../../assets/icons';
import { AUTH_TEXTS } from '../../../constants';
import type { InputProps } from '../input';

interface PasswordInputProps extends Omit<InputProps, 'type'> {
  showPasswordToggle?: boolean;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  showPasswordToggle = true,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="relative">
      <Input
        type={showPassword ? 'text' : 'password'}
        className={`pr-10 ${className}`}
        {...props}
      />
      {showPasswordToggle && (
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute top-8 right-0"
          aria-label={
            showPassword ? AUTH_TEXTS.HIDE_PASSWORD : AUTH_TEXTS.SHOW_PASSWORD
          }
        >
          {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
        </Button>
      )}
    </div>
  );
};
