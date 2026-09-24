import { Modal, Button } from '@/components/ui';
import { GST_EXEMPT_PARTY_PROFILE_TEXT } from '../constants/purchasePartyProfileConstants';

interface GstExemptPartyProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GstExemptPartyProfileModal = ({
  isOpen,
  onClose,
}: GstExemptPartyProfileModalProps) => {
  return (
    <Modal
      open={isOpen}
      onOpenChange={open => {
        if (!open) {
          onClose();
        }
      }}
      title={GST_EXEMPT_PARTY_PROFILE_TEXT.title}
      size="sm"
      footer={
        <div className="flex justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            {GST_EXEMPT_PARTY_PROFILE_TEXT.close}
          </Button>
        </div>
      }
    >
      <p className="text-sm text-text-secondary">
        {GST_EXEMPT_PARTY_PROFILE_TEXT.message}
      </p>
    </Modal>
  );
};

export default GstExemptPartyProfileModal;
