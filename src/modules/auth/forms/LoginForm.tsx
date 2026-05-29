import React, { useState } from 'react';
import { Button } from '../../../components/ui/button1/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import {
  Form,
  FormFieldInput,
  FormFieldPassword,
  FormFieldPhoneInput,
} from '../../../components/forms';
import { AUTH_TEXTS } from '../../../constants';
import { useLogin } from '../hooks';
import { yupResolver } from '@hookform/resolvers/yup';
import { otpMobileSchema, otpSchema } from '../schema';
import type { PhoneCountryCodeOption } from '../../../components/ui/phoneInput';

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

      <Tabs
        value={loginMethod}
        onValueChange={value => {
          const nextMethod = value === 'otp' ? 'otp' : 'password';
          setLoginMethod(nextMethod);

          if (nextMethod === 'otp') {
            setOtpStep('mobile');
          }
        }}
      >
        <TabsList className="grid grid-cols-2 rounded-2xl bg-primary-50/80 p-1.5 shadow-sm shadow-primary-100/50">
          <TabsTrigger
            value="password"
            className="w-full"
          >
            Password
          </TabsTrigger>
          <TabsTrigger
            value="otp"
            className="w-full"
          >
            OTP
          </TabsTrigger>
        </TabsList>

        <TabsContent value="password" className="border-0 mt-4 p-0">
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
        </TabsContent>

        <TabsContent value="otp" className="border-0 mt-4 p-0">
          {otpStep === 'mobile' ? (
            <Form
              onSubmit={onOtpMobileSubmit}
              resolver={yupResolver(otpMobileSchema)}
              className="space-y-4"
              defaultValues={{ countryCode: '+1', mobileNumber: '' }}
            >
              <FormFieldPhoneInput
                countryCodeName="countryCode"
                numberName="mobileNumber"
                label="Mobile Number"
                countryCodeLabel="Code"
                numberLabel="Mobile Number"
                disabled={isLoading}
              />
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
              <div className="mb-4 text-center">
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
        </TabsContent>
      </Tabs>
    </div>
  );
};
