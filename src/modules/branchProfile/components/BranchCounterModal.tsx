import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@/components/ui/button1';
import { Modal } from '@/components/ui/modal';
import { Form, FormFieldCheckbox, FormFieldInput } from '@/components/forms';
import { branchCounterSchema } from '../schema';
import type { ICreateBranchCounter } from '../types';

interface BranchCounterModalProps {
  open: boolean;
  title: string;
  description?: string;
  submitLabel: string;
  defaultValues: ICreateBranchCounter;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ICreateBranchCounter) => void | Promise<void>;
  isSubmitting?: boolean;
}

export const BranchCounterModal = ({
  open,
  title,
  description,
  submitLabel,
  defaultValues,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: BranchCounterModalProps) => {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      size="md"
    >
      <Form
        onSubmit={onSubmit}
        resolver={yupResolver(branchCounterSchema)}
        defaultValues={defaultValues}
        className="space-y-6"
      >
        <div className="grid gap-4">
          <FormFieldInput
            name="counterNo"
            label="Counter No."
            type="number"
            disabled={isSubmitting}
          />
          <FormFieldInput
            name="name"
            label="Counter Name"
            disabled={isSubmitting}
          />
        <FormFieldCheckbox
          name="isActive"
          label="Active"
          disabled={isSubmitting}
        />
        </div>

        <div className="flex justify-end border-t border-border-primary pt-4">
          <Button type="submit" disabled={isSubmitting} className="rounded-sm">
            {isSubmitting ? 'Saving...' : submitLabel}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};
