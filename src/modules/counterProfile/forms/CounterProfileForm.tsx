import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@/components/ui/button1';
import { Form, FormFieldCheckbox, FormFieldInput } from '@/components/forms';
import { counterProfileSchema } from '../schema';
import { COUNTER_PROFILE_TEXTS } from '../constants';
import type { CounterProfileFormValues } from '../types';
import type { SubmitErrorHandler } from 'react-hook-form';

interface CounterProfileFormProps {
  defaultValues: CounterProfileFormValues;
  onSubmit: (values: CounterProfileFormValues) => void | Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
}

export const CounterProfileForm = ({
  defaultValues,
  onSubmit,
  submitLabel = COUNTER_PROFILE_TEXTS.CREATE_COUNTER,
  isSubmitting = false,
}: CounterProfileFormProps) => {
  const handleSubmitErrors: SubmitErrorHandler<CounterProfileFormValues> =
    errors => {
      console.log('CounterProfileForm submit errors:', errors);
    };

  return (
    <Form
      onSubmit={onSubmit}
      onError={handleSubmitErrors}
      resolver={yupResolver(counterProfileSchema)}
      defaultValues={defaultValues}
      className="space-y-6"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <FormFieldInput
          name="counterCode"
          label="Counter Code"
          disabled={isSubmitting}
        />
        <FormFieldInput
          name="counterName"
          label="Counter Name"
          disabled={isSubmitting}
        />
      </div>

      <div className="rounded-sm border border-border-primary bg-surface-secondary p-4">
        <FormFieldCheckbox
          name="isActive"
          label="Is Active"
          disabled={isSubmitting}
        />
      </div>

      <div className="flex justify-end border-t border-border-primary pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </Form>
  );
};
