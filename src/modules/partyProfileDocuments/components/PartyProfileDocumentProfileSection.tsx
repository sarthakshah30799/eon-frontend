import { CardSection } from '@/components/ui';
import type { IPartyProfileDocumentProfile } from '../types/partyProfileDocumentTypes';
import { PartyProfileDocumentRuleRow } from './PartyProfileDocumentRuleRow';

interface PartyProfileDocumentProfileSectionProps {
  partyProfileId: string;
  profile: IPartyProfileDocumentProfile;
  disabled?: boolean;
  onUpload: (ruleId: string, file: File) => void | Promise<void>;
}

export const PartyProfileDocumentProfileSection = ({
  partyProfileId,
  profile,
  disabled = false,
  onUpload,
}: PartyProfileDocumentProfileSectionProps) => {
  return (
    <CardSection
      heading={`${profile.specificationType} · ${profile.type}`}
    >
      <div className="space-y-3">
        {profile.profileDescription && (
          <p className="text-sm text-text-secondary">{profile.profileDescription}</p>
        )}
        <p className="text-sm text-text-secondary">
          Group: {profile.groupSelection || '-'} · Entity Type: {profile.entitySelection || '-'}
        </p>
        <div className="space-y-3">
          {profile.rules.map(rule => (
            <PartyProfileDocumentRuleRow
              key={rule.id}
              partyProfileId={partyProfileId}
              rule={rule}
              disabled={disabled}
              onUpload={onUpload}
            />
          ))}
        </div>
      </div>
    </CardSection>
  );
};
