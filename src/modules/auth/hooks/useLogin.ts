import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { authApi } from '../../../api/auth';
import { loginSchema } from '../schema';
import { useAuth } from '../../../lib/AuthContext';
import type { LoginFormData } from '../schema';
import { yupResolver } from '@hookform/resolvers/yup';

export const useLogin = () => {
  const { login: authLogin } = useAuth();

  const mutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      await authApi.login(data);
      return data;
    },
    onSuccess: async (loginData) => {
      toast.success('Login successful!');
      
      try {
        await authLogin(loginData.email, loginData.password);
        // Redirect to dashboard or home page
        window.location.href = '/';
      } catch (error) {
        console.error('Failed to complete login:', error);
        toast.error('Login successful but failed to complete authentication');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Login failed');
    },
  });

  const handleLogin = (data: LoginFormData) => {
    mutation.mutate(data);
  };

  const handleForgotPassword = () => {
    // This will be implemented when we create the forgot password page
    toast.success('Redirecting to forgot password...');
    // Navigate to forgot password page
  };

  return {
    handleLogin,
    handleForgotPassword,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    resolver: yupResolver(loginSchema),
  };
};
