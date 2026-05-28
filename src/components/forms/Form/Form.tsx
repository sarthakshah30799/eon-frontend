import React from 'react';
import {
  FormProvider as RHFFormProvider,
  useForm,
  type DefaultValues,
  type FieldValues,
  type Resolver,
} from 'react-hook-form';

interface FormProps<TFieldValues extends FieldValues = FieldValues> {
  children: React.ReactNode;
  onSubmit: (data: TFieldValues) => void | Promise<void>;
  className?: string;
  resolver?: Resolver<TFieldValues>;
  defaultValues?: DefaultValues<TFieldValues>;
}

export const Form = <TFieldValues extends FieldValues = FieldValues>({
  children,
  onSubmit,
  className = '',
  resolver,
  defaultValues,
}: FormProps<TFieldValues>) => {
  const form = useForm<TFieldValues>({
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
