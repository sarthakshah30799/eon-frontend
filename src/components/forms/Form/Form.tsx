import React from 'react';
import {
  FormProvider as RHFFormProvider,
  useForm,
  type DefaultValues,
  type FieldValues,
  type SubmitErrorHandler,
  type Resolver,
} from 'react-hook-form';
import { FormFooter } from '@/components/ui';

interface FormProps<TFieldValues extends FieldValues = FieldValues> {
  children: React.ReactNode;
  onSubmit: (data: TFieldValues) => void | Promise<void>;
  onError?: SubmitErrorHandler<TFieldValues>;
  className?: string;
  id?: string;
  resolver?: Resolver<TFieldValues>;
  defaultValues?: DefaultValues<TFieldValues>;
  mode?: 'onChange' | 'onBlur' | 'onSubmit' | 'onTouched' | 'all';
  footer?: {
    submitLabel?: string;
    backLabel?: string;
    onBackClick?: () => void;
    onCancel?: () => void | Promise<void>;
    accentColor?: string;
    actions?: React.ReactNode;
  };
}

export const Form = <TFieldValues extends FieldValues = FieldValues>({
  children,
  onSubmit,
  onError,
  className = '',
  id,
  resolver,
  defaultValues,
  mode,
  footer,
}: FormProps<TFieldValues>) => {
  const form = useForm<TFieldValues>({
    resolver,
    defaultValues,
    mode,
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
      {footer ? (
        <FormFooter
          formId={id}
          submitLabel={footer.submitLabel}
          backLabel={footer.backLabel}
          onBackClick={footer.onBackClick}
          onCancel={footer.onCancel}
          isSubmitting={form.formState.isSubmitting}
          actions={footer.actions}
        />
      ) : null}
    </RHFFormProvider>
  );
};
