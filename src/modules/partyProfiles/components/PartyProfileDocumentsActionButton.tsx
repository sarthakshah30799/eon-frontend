import { useNavigate } from 'react-router-dom';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button1';
import { buildPartyProfileDocumentsPath } from '@/modules/partyProfileDocuments/utils/partyProfileDocumentRoutes';

interface PartyProfileDocumentsActionButtonProps {
  partyProfileId: string;
  partyProfileType: string;
  label?: string;
  compact?: boolean;
}

export const PartyProfileDocumentsActionButton = ({
  partyProfileId,
  partyProfileType,
  label = 'Documents',
  compact = false,
}: PartyProfileDocumentsActionButtonProps) => {
  const navigate = useNavigate();

  return (
    <Button
      type="button"
      variant={compact ? 'ghost' : 'outline'}
      size={compact ? 'icon' : 'default'}
      className={`rounded-sm ${
        compact
          ? 'bg-transparent text-black! hover:bg-surface-secondary hover:text-text-primary'
          : 'gap-2'
      }`}
      aria-label={label}
      onClick={event => {
        event.stopPropagation();
        navigate(buildPartyProfileDocumentsPath(partyProfileType, partyProfileId));
      }}
    >
      <DocumentTextIcon className="h-5 w-5" />
      {!compact && <span className="ml-2">{label}</span>}
    </Button>
  );
};
