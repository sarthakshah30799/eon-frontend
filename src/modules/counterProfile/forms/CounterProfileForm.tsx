import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@/components/ui/button1';
import { Form, FormFieldCheckbox, FormFieldInput } from '@/components/forms';
import { counterProfileSchema } from '../schema';
import type { ICreateCounterProfile } from '../types';


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
  return (
    <Form
      onSubmit={onSubmit}
      resolver={yupResolver(counterProfileSchema)}
      defaultValues={defaultValues}
      className="space-y-6"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <FormFieldInput
          name="counterNo"
          label="Counter No."
          disabled={isSubmitting}
        />
        <FormFieldInput
          name="counterName"
          label="Counter Name"
          disabled={isSubmitting}
        />
      </div>

      <div className="rounded-sm border border-border-primary bg-surface-secondary p-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <FormFieldCheckbox
          name="isActive"
          label="Is Active"
          disabled={isSubmitting}
        />
        <FormFieldCheckbox
          name="isRetailCnt"
          label="Is Retail Counter"
          disabled={isSubmitting}
        />
        <FormFieldCheckbox
          name="isBulkCnt"
          label="Is Bulk Counter"
          disabled={isSubmitting}
        />
        <FormFieldCheckbox
          name="isCombineCnt"
          label="Is Combine Counter"
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
