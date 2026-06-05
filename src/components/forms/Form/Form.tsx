import React from 'react';
import {
  FormProvider as RHFFormProvider,
  useForm,
  type DefaultValues,
  type FieldValues,
  type SubmitErrorHandler,
  type Resolver,
} from 'react-hook-form';

interface FormProps<TFieldValues extends FieldValues = FieldValues> {
  children: React.ReactNode;
  onSubmit: (data: TFieldValues) => void | Promise<void>;
  onError?: SubmitErrorHandler<TFieldValues>;
  className?: string;
  id?: string;
  resolver?: Resolver<TFieldValues>;
  defaultValues?: DefaultValues<TFieldValues>;
}

export const Form = <TFieldValues extends FieldValues = FieldValues>({
  children,
  onSubmit,
  onError,
  className = '',
  id,
  resolver,
  defaultValues,
}: FormProps<TFieldValues>) => {
  const form = useForm<TFieldValues>({
    resolver,
    defaultValues,
  });

  const handleSubmit = form.handleSubmit(onSubmit, onError);
  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.stopPropagation();
    await handleSubmit(event);
  };

  return (
    <RHFFormProvider {...form}>
      <form id={id} onSubmit={handleFormSubmit} className={className}>
        {children}
      </form>
    </RHFFormProvider>
  );
};
