import React from 'react';
import { Button } from '../../../components/ui/button1/Button';
import { Link } from '../../../components/ui/link';
import {
  Form,
  FormFieldInput,
  FormFieldPassword,
  FormFieldCheckbox,
} from '../../../components/forms';
import { AUTH_TEXTS } from '../../../constants';
import { useLogin } from '../hooks';

interface LoginFormProps {
  isLoading?: boolean;
  onForgotPassword?: () => void;
  showRememberMe?: boolean;
  showSignupLink?: boolean;
  title?: string;
  subtitle?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  showRememberMe = true,
  showSignupLink = true,
  title = AUTH_TEXTS.WELCOME_BACK,
  subtitle = AUTH_TEXTS.SIGN_IN_TO_ACCOUNT,
}) => {
  const { handleLogin, resolver, isLoading, handleForgotPassword } = useLogin();

  return (
    <div className="w-full space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
        <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
      </div>

      <Form onSubmit={handleLogin} resolver={resolver} className="space-y-4">
        <FormFieldInput
          name="email"
          label={AUTH_TEXTS.EMAIL_ADDRESS}
          type="email"
          placeholder={AUTH_TEXTS.ENTER_YOUR_EMAIL}
          disabled={isLoading}
        />

        <FormFieldPassword
          name="password"
          label={AUTH_TEXTS.PASSWORD}
          placeholder={AUTH_TEXTS.ENTER_YOUR_PASSWORD}
          disabled={isLoading}
        />

        {showRememberMe && (
          <div className="flex items-center justify-between">
            <FormFieldCheckbox name="rememberMe" label={AUTH_TEXTS.REMEMBER_ME} />

            <Button
              variant="link"
              size="sm"
              type="button"
              onClick={handleForgotPassword}
            >
              {AUTH_TEXTS.FORGOT_PASSWORD}
            </Button>
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isLoading} size="lg">
          {isLoading ? AUTH_TEXTS.SIGNING_IN : AUTH_TEXTS.SIGN_IN}
        </Button>
      </Form>

      {showSignupLink && (
        <div className="text-center">
          <p className="text-sm text-gray-600">
            {AUTH_TEXTS.DONT_HAVE_ACCOUNT} <Link to="/signup">{AUTH_TEXTS.SIGN_UP}</Link>
          </p>
        </div>
      )}
    </div>
  );
};
