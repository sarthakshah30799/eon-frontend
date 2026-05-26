import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui/button1/Button';
import { Form, FormFieldInput } from '../../../components/forms';
import { yupResolver } from '@hookform/resolvers/yup';
import { otpEmailSchema } from '../../../modules/auth/schema';

const ForgotPasswordPage: React.FC = () => {
  const [isSent, setIsSent] = useState(false);
  const [email, setEmail] = useState('');

  const onSubmit = (data: { email: string }) => {
    // Mock API call to send forgot password email
    setEmail(data.email);
    setIsSent(true);
  };

  return (
    <div className="flex min-h-screen bg-primary-50">
      {/* Left side - Image */}
      <div className="relative hidden lg:block lg:w-1/2 xl:w-3/5">
        <div className="absolute inset-0 bg-sidebar-primary">
          <img
            src="/currency-exchange.jpg"
            alt="Currency Exchange"
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative flex h-full flex-col items-center justify-center px-12 text-text-inverse">
          <h1 className="mb-6 text-center text-4xl font-bold xl:text-5xl">
            Password Recovery
          </h1>
          <p className="max-w-md text-center text-lg leading-relaxed xl:text-xl">
            Regain access to your account and continue experiencing seamless
            currency trading.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex flex-1 flex-col justify-center bg-surface-primary px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-text-primary">
              Reset Password
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              Enter your email address to receive a password reset link
            </p>
          </div>

          {!isSent ? (
            <Form
              onSubmit={onSubmit}
              resolver={yupResolver(otpEmailSchema)}
              className="space-y-4"
            >
              <FormFieldInput
                name="email"
                label="Email Address"
                type="email"
                placeholder="Enter your email"
              />
              <Button type="submit" className="w-full" size="lg">
                Send Reset Link
              </Button>
            </Form>
          ) : (
            <div className="space-y-4 rounded-lg border border-success-500 bg-success-50 p-6 text-center">
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
                Check your email
              </h3>
              <p className="text-sm text-text-secondary">
                We've sent a password reset link to <strong>{email}</strong>.
                Please check your inbox.
              </p>
            </div>
          )}

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
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
