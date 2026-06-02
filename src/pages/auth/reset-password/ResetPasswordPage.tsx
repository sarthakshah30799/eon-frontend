import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '../../../components/ui/button1/Button';
import { Form, FormFieldInput } from '../../../components/forms';
import { yupResolver } from '@hookform/resolvers/yup';
import { resetPasswordSchema } from '../../../modules/auth/schema';
import { authApi } from '../../../api/auth/auth.api';
import { toast } from 'react-hot-toast';
import type { InferType } from 'yup';

type ResetPasswordFormData = InferType<typeof resetPasswordSchema>;

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token || !email) {
      toast.error('Invalid password reset link. Missing token or email.');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword({
        email,
        token,
        password: data.password,
      });
      setIsSuccess(true);
      toast.success('Password successfully reset! Existing sessions logged out.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  // If link is invalid
  const isLinkInvalid = !token || !email;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-surface-secondary via-surface-primary to-primary-50">
      {/* Left side - Image */}
      <div className="relative hidden lg:block lg:w-1/2 xl:w-3/5">
        <div className="absolute inset-0 bg-gradient-to-br from-sidebar-primary to-sidebar-secondary">
          <img
            src="/currency-exchange.jpg"
            alt="Currency Exchange"
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative flex h-full flex-col items-center justify-center px-12 text-text-inverse">
          <h1 className="mb-6 text-center text-4xl font-bold xl:text-5xl">
            Secure Password Reset
          </h1>
          <p className="max-w-md text-center text-lg leading-relaxed xl:text-xl">
            Create a strong new password to protect your account and continue
            accessing your global trading dashboard.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex flex-1 flex-col justify-center bg-surface-primary/95 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-text-primary">
              Set New Password
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              {isSuccess
                ? 'Your password has been successfully updated'
                : 'Please enter your new password below'}
            </p>
          </div>

          {isLinkInvalid ? (
            <div className="space-y-4 rounded-2xl border border-error-500 bg-error-50 p-6 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-error-100">
                <svg
                  className="h-6 w-6 text-error-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-text-primary">
                Invalid Reset Link
              </h3>
              <p className="text-sm text-text-secondary">
                This password reset link is invalid or incomplete. Please request a new link from the forgot password screen.
              </p>
              <div className="pt-2">
                <Link
                  to="/forgot-password"
                  className="inline-flex items-center justify-center rounded-lg border border-border-primary bg-surface-primary px-4 py-2 text-sm font-semibold text-text-primary hover:bg-surface-secondary"
                >
                  Back to Forgot Password
                </Link>
              </div>
            </div>
          ) : !isSuccess ? (
            <Form
              onSubmit={onSubmit}
              resolver={yupResolver(resetPasswordSchema)}
              className="space-y-4"
            >
              <FormFieldInput
                name="password"
                label="New Password"
                type="password"
                placeholder="Enter new password"
              />
              <FormFieldInput
                name="confirmPassword"
                label="Confirm New Password"
                type="password"
                placeholder="Confirm new password"
              />
              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? 'Resetting password...' : 'Update Password'}
              </Button>
            </Form>
          ) : (
            <div className="space-y-4 rounded-2xl border border-success-500 bg-success-50 p-6 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                <svg
                  className="h-6 w-6 text-primary-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-text-primary">
                Success!
              </h3>
              <p className="text-sm text-text-secondary text-center">
                Your password has been successfully updated. All active sessions have been invalidated for security. You can now log in using your new credentials.
              </p>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="w-full inline-flex items-center justify-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-text-inverse hover:bg-primary-700 shadow-md transition-colors"
                >
                  Go to Sign In
                </Link>
              </div>
            </div>
          )}

          {!isSuccess && (
            <div className="mt-8 text-center">
              <p className="text-sm text-text-secondary">
                Remember your password?{' '}
                <Link
                  to="/login"
                  className="font-medium text-primary-600 hover:text-primary-700"
                >
                  Back to Login
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
