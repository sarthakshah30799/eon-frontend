import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Input } from '@/components/ui/input1';
import { Button } from '@/components/ui/button1';
import { USER_TEXTS } from '@/constants';
import { userSchema } from '../schema/userSchema';

interface UserFormProps {
  onSubmit: (data: { name: string; email: string }) => void;
  isLoading?: boolean;
  defaultValues?: { name?: string; email?: string };
}

export const UserForm = ({ onSubmit, isLoading = false, defaultValues }: UserFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label={USER_TEXTS.NAME}
        {...register('name')}
        error={errors.name?.message}
        disabled={isLoading}
      />
      <Input
        label={USER_TEXTS.EMAIL}
        type="email"
        {...register('email')}
        error={errors.email?.message}
        disabled={isLoading}
      />
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? USER_TEXTS.SAVING : USER_TEXTS.SAVE}
      </Button>
    </form>
  );
};
