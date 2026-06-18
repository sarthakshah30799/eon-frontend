import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { ApiError, authApi } from '../../../api/auth';
import { buildLoginSchema } from '../schema';
import type { ILoginFormData } from '../schema';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuth } from '../../../lib/AuthContext';
import { PasswordValidationCodeEnum } from '../types/authTypes';

export const useLogin = () => {
  const { checkAuth, otpLogin: contextOtpLogin } = useAuth();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async (data: ILoginFormData) => {
      return await authApi.login(data);
    },
    onSuccess: async response => {
      if (response.requiresPasswordChange) {
        toast('Please set your password before logging in.', {
          icon: '🔐',
        });
        navigate('/reset-password?setup=1');
        return;
      }

      toast.success('Login successful!');

      try {
        await checkAuth();
        navigate('/');
      } catch (error) {
        console.error('Failed to complete login:', error);
        toast.error('Login successful but failed to complete authentication');
      }
    },
    onError: (error: Error) => {
      if (
        error instanceof ApiError &&
        error.code === PasswordValidationCodeEnum.AccountLocked
      ) {
        toast.error(error.message || 'Account is locked');
        return;
      }

      toast.error(error.message || 'Login failed');
    },
  });

  const sendOtpMutation = useMutation({
    mutationFn: async (data: { countryCode: string; mobileNumber: string }) => {
      return await authApi.sendOtp(data.countryCode, data.mobileNumber);
    },
    onSuccess: () => {
      toast.success('OTP sent successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send OTP');
    },
  });

  const handleLogin = (data: ILoginFormData) => {
    mutation.mutate(data);
  };

  const handleSendOtp = async (countryCode: string, mobileNumber: string) => {
    return sendOtpMutation.mutateAsync({ countryCode, mobileNumber });
  };

  const handleOtpLogin = async (
    countryCode: string,
    mobileNumber: string,
    otp: string
  ) => {
    try {
      await contextOtpLogin(countryCode, mobileNumber, otp);
      toast.success('OTP verified successfully!');
      navigate('/');
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Invalid OTP or User not found';
      toast.error(errorMessage);
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return {
    handleLogin,
    handleSendOtp,
    handleOtpLogin,
    handleForgotPassword,
    isLoading: mutation.isPending || sendOtpMutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    resolver: yupResolver(buildLoginSchema()),
  };
};
