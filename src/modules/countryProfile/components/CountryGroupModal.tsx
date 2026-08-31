import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button1';
import {
  createEmptyCountryGroupFormValues,
  CountryGroupForm,
  useCreateCountryGroup,
} from '@/modules/countryGroup';

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
  const { submitCountryGroup, isPending } = useCreateCountryGroup();
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!open) {
    return null;
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSubmitError(null);
    }
    onOpenChange(nextOpen);
  };

  return (
    <Modal
      open={open}
      onOpenChange={handleOpenChange}
      title="Create Country Group"
      description="Add a new country group to assign to country profiles."
      size="xl"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" form="country-group-form" disabled={isPending}>
            {isPending ? 'Creating...' : 'Create Country Group'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {submitError ? (
          <div className="rounded-sm border border-error-500 bg-error-50 px-4 py-3 text-sm text-error-700">
            {submitError}
          </div>
        ) : null}

        <CountryGroupForm
          defaultValues={{
            ...createEmptyCountryGroupFormValues(),
            name: initialName,
          }}
          onSubmit={async values => {
            setSubmitError(null);
            try {
              const newGroup = await submitCountryGroup(values);
              onSuccess(newGroup.id);
              onOpenChange(false);
            } catch (error) {
              setSubmitError(
                error instanceof Error
                  ? error.message
                  : 'Failed to create country group'
              );
            }
          }}
          isSubmitting={isPending}
          onCancel={() => handleOpenChange(false)}
          showFooter={false}
        />
      </div>
    </Modal>
  );
};

export default CountryGroupModal;
