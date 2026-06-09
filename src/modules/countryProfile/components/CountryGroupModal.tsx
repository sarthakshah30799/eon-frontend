import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button1';
import { FormFieldInput } from '@/components/forms';
import { countryGroupApi } from '@/api';

interface CountryGroupModalFormValues {
  name: string;
  code: string;
}

interface CountryGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (newGroupId: string) => void;
  initialName?: string;
}

export const CountryGroupModal = ({
  open,
  onOpenChange,
  onSuccess,
  initialName = '',
}: CountryGroupModalProps) => {
  const form = useForm<CountryGroupModalFormValues>({
    defaultValues: {
      name: initialName,
      code: '',
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = form.handleSubmit(async values => {
    const nextName = values.name.trim();
    const nextCode = values.code.trim();

    if (!nextName) {
      form.setError('name', {
        type: 'manual',
        message: 'Name is required',
      });
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const newGroup = await countryGroupApi.createCountryGroup({
        name: nextName,
        code: nextCode || undefined,
      });
      onSuccess(newGroup.id);
      form.reset({
        name: '',
        code: '',
      });
      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to create country group'
      );
    } finally {
      setIsSubmitting(false);
    }
  });

  const handleClose = () => {
    form.reset({
      name: '',
      code: '',
    });
    setError(null);
    onOpenChange(false);
  };

  return (
    <Modal
      open={open}
      onOpenChange={handleClose}
      title="Create Country Group"
      description="Add a new country group to assign to country profiles."
      size="md"
    >
      <FormProvider {...form}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-sm border border-error-500 bg-error-55 p-3 text-sm text-error-700">
              {error}
            </div>
          )}

          <FormFieldInput
            name="name"
            label="Country Group Name *"
            placeholder="e.g. Europe"
            disabled={isSubmitting}
            valueTransform="none"
          />

          <FormFieldInput
            name="code"
            label="Country Group Code"
            placeholder="e.g. EU"
            disabled={isSubmitting}
            valueTransform="none"
          />

          <div className="flex justify-end gap-3 border-t border-border-primary pt-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
};
