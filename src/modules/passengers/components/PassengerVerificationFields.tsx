import type { PassengerEntityType } from '../types/passengerTypes';
import { PassengerIdentityFields } from './PassengerIdentityFields';

interface PassengerVerificationFieldsProps {
  entityType: PassengerEntityType;
  isCorporate: boolean;
  selectedPartyProfileLabel: string;
  verificationStatus: 'idle' | 'checking' | 'valid' | 'invalid';
  verificationMessage: string | null;
  onPanFieldBlur?: () => void;
  onPassportFieldBlur?: () => void;
  onNationalityChange?: (value: string | null) => void;
}

export const PassengerVerificationFields = ({
  entityType,
  isCorporate,
  selectedPartyProfileLabel,
  verificationStatus,
  verificationMessage,
  onPanFieldBlur,
  onPassportFieldBlur,
  onNationalityChange,
}: PassengerVerificationFieldsProps) => {
  const isIndianPrompt = !isCorporate;

  return (
    <div className="space-y-5">
      {isCorporate ? (
        <div className="rounded-sm border border-border-primary bg-surface-secondary px-4 py-3 text-sm text-text-secondary">
          <div className="font-medium text-text-primary">Selected Party Profile</div>
          <div>{selectedPartyProfileLabel}</div>
        </div>
      ) : (
        <div className="rounded-sm border border-border-primary bg-surface-secondary px-4 py-3 text-sm text-text-secondary">
          <div className="font-medium text-text-primary">Individual Passenger</div>
          <div>Choose Indian or NRI / Foreigner before AML verification.</div>
        </div>
      )}

      <PassengerIdentityFields
        entityType={entityType}
        showNationality={isIndianPrompt}
        onPanFieldBlur={onPanFieldBlur}
        onPassportFieldBlur={onPassportFieldBlur}
        onNationalityChange={onNationalityChange}
      />

      <div
        className={`rounded-sm border px-4 py-3 text-xs ${
          verificationStatus === 'valid'
            ? 'border-success/30 bg-success/5 text-success'
            : verificationStatus === 'invalid'
              ? 'border-error/30 bg-error/5 text-error'
              : 'border-border-secondary bg-surface-secondary text-text-secondary'
        }`}
      >
        {verificationMessage ||
          (verificationStatus === 'valid'
            ? 'AML details verified. You can continue.'
            : verificationStatus === 'invalid'
              ? 'Verification failed. Edit the details and blur the field again to re-check.'
              : 'Fill all required PAN or passport fields, then blur any field to validate against the backend.')}
      </div>
    </div>
  );
};
