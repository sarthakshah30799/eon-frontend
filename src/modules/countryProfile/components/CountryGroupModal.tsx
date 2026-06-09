import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button1';
import { Input } from '@/components/ui/input';
import { countryGroupApi } from '@/api';

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
  const [name, setName] = useState(initialName);
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError('Name is required');
      return;
    }
    setNameError(null);
    setError(null);
    setIsSubmitting(true);

    try {
      const newGroup = await countryGroupApi.createCountryGroup({
        name: name.trim(),
        code: code.trim() || undefined,
      });
      onSuccess(newGroup.id);
      // Reset form fields
      setName('');
      setCode('');
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create country group');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName('');
    setCode('');
    setNameError(null);
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
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-sm border border-error-500 bg-error-55 p-3 text-sm text-error-700">
            {error}
          </div>
        )}

        <Input
          label="Country Group Name *"
          placeholder="e.g. Europe"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (e.target.value.trim()) {
              setNameError(null);
            }
          }}
          error={nameError || undefined}
          disabled={isSubmitting}
        />

        <Input
          label="Country Group Code"
          placeholder="e.g. EU"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={isSubmitting}
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
    </Modal>
  );
};
