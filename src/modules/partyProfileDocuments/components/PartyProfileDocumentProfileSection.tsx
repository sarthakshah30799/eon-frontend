import { partyProfileDocumentsApi } from '@/api/partyProfileDocuments';
import { DocumentRequirementCard } from '@/modules/documentProfiles/components/DocumentRequirementCard';
import type { IPartyProfileDocumentProfile } from '../types/partyProfileDocumentTypes';

interface PartyProfileDocumentProfileSectionProps {
  partyProfileId: string;
  profile: IPartyProfileDocumentProfile;
  disabled?: boolean;
  selectedFile?: File | null;
  onSelectFile: (documentProfileId: string, file: File) => void | Promise<void>;
  onClearFile?: (documentProfileId: string) => void | Promise<void>;
}

export const PartyProfileDocumentProfileSection = ({
  partyProfileId,
  profile,
  disabled = false,
  selectedFile = null,
  onSelectFile,
  onClearFile,
}: PartyProfileDocumentProfileSectionProps) => {
  return (
    <DocumentRequirementCard
      profile={profile}
      disabled={disabled}
      selectedFile={selectedFile}
      onSelectFile={onSelectFile}
      onClearFile={onClearFile}
      downloadUrl={
        profile.documentFile
          ? partyProfileDocumentsApi.getDownloadUrl(partyProfileId, profile.id)
          : undefined
      }
    />
  );
};

export default PartyProfileDocumentProfileSection;
