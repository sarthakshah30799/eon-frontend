import React from 'react';
import { FormProvider as RHFFormProvider, useForm } from 'react-hook-form';

interface FormProps {
  children: React.ReactNode;
  onSubmit: (data: any) => void | Promise<void>;
  className?: string;
  resolver?: any;
  defaultValues?: any;
}

export const Form = ({
  children,
  onSubmit,
  className = '',
  resolver,
  defaultValues,
}: FormProps) => {
  const form = useForm({
    resolver,
    defaultValues,
  });

  const handleSubmit = form.handleSubmit(onSubmit);

  return (
    <RHFFormProvider {...form}>
      <form onSubmit={handleSubmit} className={className}>
        {children}
      </form>
    </RHFFormProvider>
  );
};
