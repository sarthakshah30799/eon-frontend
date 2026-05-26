import React from 'react';
import { LoginForm } from '../forms';

export const LoginView: React.FC = () => {
  return (
    <div className="relative flex min-h-screen overflow-hidden bg-gradient-to-br from-primary-50 via-surface-primary to-primary-100">
      <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-primary-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-primary-300/30 blur-3xl" />

      {/* Left side - Image */}
      <div className="relative hidden overflow-hidden lg:block lg:w-1/2 xl:w-3/5">
        <div className="absolute inset-0 bg-gradient-to-br from-sidebar-primary via-primary-700 to-sidebar-secondary">
          <img
            src="/currency-exchange.jpg"
            alt="Currency Exchange"
            className="absolute inset-0 h-full w-full object-cover opacity-22 mix-blend-overlay"
          />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.22),_transparent_35%),linear-gradient(180deg,_rgba(15,23,42,0.08),_rgba(15,23,42,0.45))]" />
        <div className="relative flex h-full flex-col items-center justify-center px-12 text-text-inverse">
          <div className="mb-6 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-white/90 backdrop-blur-sm">
            Professional FX Dashboard
          </div>
          <h1 className="mb-6 text-center text-4xl font-bold tracking-tight xl:text-5xl">
            Global Currency Exchange
          </h1>
          <p className="max-w-md text-center text-lg leading-relaxed text-white/90 xl:text-xl">
            Experience seamless currency trading with real-time rates, secure
            transactions, and global market access at your fingertips.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-4 text-center">
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-4 backdrop-blur-sm">
              <div className="text-3xl font-bold">150+</div>
              <div className="text-sm text-white/80">Currencies</div>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-4 backdrop-blur-sm">
              <div className="text-3xl font-bold">24/7</div>
              <div className="text-sm text-white/80">Trading</div>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-4 backdrop-blur-sm">
              <div className="text-3xl font-bold">99.9%</div>
              <div className="text-sm text-white/80">Uptime</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full">
          {/* Logo/Brand */}
          <div className="mx-auto mb-8 max-w-lg rounded-3xl bg-surface-primary/92 px-6 py-8 shadow-2xl shadow-primary-100/70 backdrop-blur-xl">
            <div className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 shadow-lg shadow-primary-200/60">
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
              <h2 className="text-2xl font-bold tracking-tight text-text-primary">
                Sign in to your account
              </h2>
              <p className="mt-2 text-sm text-text-secondary">
                Access your currency trading dashboard
              </p>
            </div>
            <div className="mt-8">
              <LoginForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
