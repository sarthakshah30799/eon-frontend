
import { Modal } from '@/components/ui';
import { Button } from '@/components/ui';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface HighRiskPartyProfileWarningModalProps {
  isOpen: boolean;
  partyProfileName: string;
  onConfirm: () => void;
  onCancel: () => void;
  onClose: () => void;
}

export const HighRiskPartyProfileWarningModal = ({
  isOpen,
  partyProfileName,
  onConfirm,
  onCancel,
  onClose,
}: HighRiskPartyProfileWarningModalProps) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleCancel = () => {
    onCancel();
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onOpenChange={onClose}
      title="High Risk Party Profile"
      description={`The selected party profile "${partyProfileName}" has been marked as high risk. Are you sure you want to proceed with this transaction?`}
      size="md"
    >
      <div className="space-y-4">
        <div className="rounded-sm border border-warning-200 bg-warning-50 p-4">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-warning-600" />
            <div>
              <p className="text-sm font-medium text-warning-800">
                High Risk Warning
              </p>
              <p className="text-xs text-warning-700 mt-1">
                This party profile has been flagged as high risk. Please proceed with caution.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border-primary">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
          >
            Proceed Anyway
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default HighRiskPartyProfileWarningModal;