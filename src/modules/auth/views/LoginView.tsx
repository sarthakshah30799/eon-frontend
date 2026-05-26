import React from 'react';
import { LoginForm } from '../forms';

export const LoginView: React.FC = () => {
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
            Global Currency Exchange
          </h1>
          <p className="max-w-md text-center text-lg leading-relaxed xl:text-xl">
            Experience seamless currency trading with real-time rates, secure
            transactions, and global market access at your fingertips.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold">150+</div>
              <div className="text-sm opacity-90">Currencies</div>
            </div>
            <div>
              <div className="text-3xl font-bold">24/7</div>
              <div className="text-sm opacity-90">Trading</div>
            </div>
            <div>
              <div className="text-3xl font-bold">99.9%</div>
              <div className="text-sm opacity-90">Uptime</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex flex-1 flex-col justify-center bg-surface-primary px-4 sm:px-6 lg:px-8">
        <div className="w-full">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary-600">
              <svg
                className="h-8 w-8 text-text-inverse"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-text-primary">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              Access your currency trading dashboard
            </p>
          </div>

          <LoginForm />

          {/* Mobile-only image section */}
          <div className="lg:hidden mt-8 text-center">
            <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
              <svg
                className="h-6 w-6 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-xs text-text-tertiary">
              Trade 150+ currencies worldwide
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
