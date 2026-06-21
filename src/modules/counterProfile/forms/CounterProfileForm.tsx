import { yupResolver } from '@hookform/resolvers/yup';
import { Form, FormFieldCheckbox, FormFieldInput } from '@/components/forms';
import { counterProfileSchema } from '../schema';
import type { ICreateCounterProfile } from '../types';
import { useNavigate } from 'react-router-dom';

interface CounterProfileFormProps {
  defaultValues: ICreateCounterProfile;
  onSubmit: (values: ICreateCounterProfile) => void | Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
}

export const CounterProfileForm = ({
  defaultValues,
  onSubmit,
  submitLabel = 'Save Counter',
  isSubmitting = false,
}: CounterProfileFormProps) => {
  const navigate = useNavigate();

  const onCancel = () => {
    navigate('/admin/counter-profile');
  };
  return (
    <Form
      onSubmit={onSubmit}
      resolver={yupResolver(counterProfileSchema)}
      defaultValues={defaultValues}
      className="space-y-6"
      footer={{
        submitLabel,
        backLabel: 'Back',
        onBackClick: () => {
          void onCancel?.();
        },
        onCancel,
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <FormFieldInput
          name="counterNo"
          label="Counter No."
          disabled={isSubmitting}
        />
        <FormFieldInput
          name="name"
          label="Counter Name"
          disabled={isSubmitting}
        />
      </div>

      <div className="rounded-sm border border-border-primary bg-surface-secondary p-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <FormFieldCheckbox
          name="isActive"
          label="Active"
          disabled={isSubmitting}
        />
        <FormFieldCheckbox
          name="isRetail"
          label="Retail Counter"
          disabled={isSubmitting}
        />
        <FormFieldCheckbox
          name="isBulk"
          label="Bulk Counter"
          disabled={isSubmitting}
        />
        <FormFieldCheckbox
          name="isCombine"
          label="Combine Counter"
          disabled={isSubmitting}
        />
      </div>
    </Form>
  );
};
