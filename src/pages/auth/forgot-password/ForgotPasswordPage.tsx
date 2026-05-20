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
    <div className="min-h-screen bg-gray-100 flex">
      {/* Left side - Image */}
      <div className="hidden lg:block lg:w-1/2 xl:w-3/5 relative">
        <div className="absolute inset-0 bg-linear-to-br from-blue-600 to-blue-800">
          <img
            src="/currency-exchange.jpg"
            alt="Currency Exchange"
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative flex flex-col justify-center items-center h-full px-12 text-white">
          <h1 className="text-4xl xl:text-5xl font-bold mb-6 text-center">
            Password Recovery
          </h1>
          <p className="text-lg xl:text-xl text-center max-w-md leading-relaxed">
            Regain access to your account and continue experiencing seamless
            currency trading.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 bg-white">
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Reset Password</h2>
            <p className="mt-2 text-sm text-gray-600">
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
            <div className="text-center space-y-4 bg-green-50 p-6 rounded-lg border border-green-200">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg
                  className="h-6 w-6 text-green-600"
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
              <h3 className="text-lg font-medium text-green-800">
                Check your email
              </h3>
              <p className="text-sm text-green-700">
                We've sent a password reset link to <strong>{email}</strong>.
                Please check your inbox.
              </p>
            </div>
          )}

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Remember your password?{' '}
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-500"
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
