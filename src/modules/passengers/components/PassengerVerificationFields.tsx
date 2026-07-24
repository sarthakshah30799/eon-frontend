import { Loader } from '@/components/ui/loader';
import type { PassengerEntityType } from '../types/passengerTypes';
import { PassengerIdentityFields } from './PassengerIdentityFields';

interface PassengerVerificationFieldsProps {
  entityType: PassengerEntityType;
  isCorporate: boolean;
  selectedPartyProfileLabel: string;
  isSelectedPartyProfileLoading?: boolean;
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
  isSelectedPartyProfileLoading = false,
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
          {isSelectedPartyProfileLoading ? (
            <div className="mt-2 flex items-center gap-2 text-text-secondary">
              <Loader variant="spinner" size="sm" />
              <span>Loading selected party profile...</span>
            </div>
          ) : (
            <div>{selectedPartyProfileLabel}</div>
          )}
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
          verificationStatus === 'checking'
            ? 'border-info-200 bg-info-50 text-info-700'
            : verificationStatus === 'valid'
            ? 'border-success-200 bg-success-50 text-success-700'
            : verificationStatus === 'invalid'
              ? 'border-error-200 bg-error-50 text-error-700'
              : 'border-border-secondary bg-surface-secondary text-text-secondary'
        }`}
      >
        <div className="flex items-center gap-2">
          {verificationStatus === 'checking' ? (
            <>
              <Loader variant="spinner" size="sm" />
              <span className="font-medium">Verifying AML details...</span>
            </>
          ) : (
            <span className="font-medium">
              {verificationMessage ||
                (verificationStatus === 'valid'
                  ? 'AML details verified. You can continue.'
                  : verificationStatus === 'invalid'
                    ? 'Verification failed. Edit the details and blur the field again to re-check.'
                    : 'Fill all required PAN or passport fields, then blur any field to validate against the backend.')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
