import React, { useState } from 'react';
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
import { yupResolver } from '@hookform/resolvers/yup';
import { otpMobileSchema, otpSchema } from '../schema';

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
  const {
    handleLogin,
    handleOtpLogin,
    handleSendOtp,
    resolver,
    isLoading,
    handleForgotPassword,
  } = useLogin();
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>(
    'password'
  );
  const [otpStep, setOtpStep] = useState<'mobile' | 'otp'>('mobile');
  const [otpMobileData, setOtpMobileData] = useState({
    countryCode: '+1',
    mobileNumber: '',
  });

  const onOtpMobileSubmit = async (data: {
    countryCode: string;
    mobileNumber: string;
  }) => {
    setOtpMobileData({
      countryCode: data.countryCode,
      mobileNumber: data.mobileNumber,
    });
    try {
      await handleSendOtp(data.countryCode, data.mobileNumber);
      setOtpStep('otp');
    } catch {
      // Error is handled in the hook via toast
    }
  };

  const onOtpSubmit = (data: { otp: string }) => {
    handleOtpLogin(
      otpMobileData.countryCode,
      otpMobileData.mobileNumber,
      data.otp
    );
  };

  return (
    <div className="w-full space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-text-primary">{title}</h2>
        <p className="mt-2 text-sm text-text-secondary">{subtitle}</p>
      </div>

      <div className="flex space-x-1 rounded-2xl bg-primary-50/80 p-1.5 shadow-sm shadow-primary-100/50">
        <button
          type="button"
          className={`w-full rounded-xl py-2.5 text-sm font-medium leading-5 transition ${
            loginMethod === 'password'
              ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-text-inverse shadow-lg shadow-primary-200/50'
              : 'text-text-secondary hover:bg-white/80 hover:text-primary-600'
          }`}
          onClick={() => setLoginMethod('password')}
        >
          Password
        </button>
        <button
          type="button"
          className={`w-full rounded-xl py-2.5 text-sm font-medium leading-5 transition ${
            loginMethod === 'otp'
              ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-text-inverse shadow-lg shadow-primary-200/50'
              : 'text-text-secondary hover:bg-white/80 hover:text-primary-600'
          }`}
          onClick={() => {
            setLoginMethod('otp');
            setOtpStep('mobile');
          }}
        >
          OTP
        </button>
      </div>

      {loginMethod === 'password' ? (
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
              <FormFieldCheckbox
                name="rememberMe"
                label={AUTH_TEXTS.REMEMBER_ME}
              />

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

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? AUTH_TEXTS.SIGNING_IN : AUTH_TEXTS.SIGN_IN}
          </Button>
        </Form>
      ) : otpStep === 'mobile' ? (
        <Form
          onSubmit={onOtpMobileSubmit}
          resolver={yupResolver(otpMobileSchema)}
          className="space-y-4"
          defaultValues={{ countryCode: '+1', mobileNumber: '' }}
        >
          <div className="flex gap-2">
            <div className="w-1/3">
              <FormFieldInput
                name="countryCode"
                label="Code"
                type="text"
                placeholder="+1"
                disabled={isLoading}
              />
            </div>
            <div className="w-2/3">
              <FormFieldInput
                name="mobileNumber"
                label="Mobile Number"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Enter mobile number"
                disabled={isLoading}
                onInput={(e: React.FormEvent<HTMLInputElement>) => {
                  e.currentTarget.value = e.currentTarget.value.replace(
                    /[^0-9]/g,
                    ''
                  );
                }}
              />
            </div>
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
            size="lg"
          >
            Send OTP
          </Button>
        </Form>
      ) : (
        <Form
          onSubmit={onOtpSubmit}
          resolver={yupResolver(otpSchema)}
          className="space-y-4"
        >
          <div className="text-center mb-4">
            <p className="text-sm text-text-secondary">
              Enter the OTP sent to {otpMobileData.countryCode}{' '}
              {otpMobileData.mobileNumber}
            </p>
          </div>
          <FormFieldInput
            name="otp"
            label="One Time Password"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Enter 123456"
            disabled={isLoading}
            maxLength={6}
            onInput={(e: React.FormEvent<HTMLInputElement>) => {
              e.currentTarget.value = e.currentTarget.value.replace(
                /[^0-9]/g,
                ''
              );
            }}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
            size="lg"
          >
            Verify & Login
          </Button>
          <Button
            variant="ghost"
            type="button"
            className="w-full"
            onClick={() => setOtpStep('mobile')}
          >
            Back to Mobile
          </Button>
        </Form>
      )}

      {showSignupLink && (
        <div className="text-center">
          <p className="text-sm text-text-secondary">
            {AUTH_TEXTS.DONT_HAVE_ACCOUNT}{' '}
            <Link to="/signup">{AUTH_TEXTS.SIGN_UP}</Link>
          </p>
        </div>
      )}
    </div>
  );
};
