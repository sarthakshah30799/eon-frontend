import type { PassengerEntityType } from '../types/passengerTypes';
import { PassengerDetailsFields } from '../components/PassengerDetailsFields';

interface PassengerAmlDetailsStepFormProps {
  entityType: PassengerEntityType;
  showPanRelation?: boolean;
  onPanFieldBlur?: () => void;
  onPassportNumberBlur?: () => void;
  onPassportFieldBlur?: () => void;
  onNationalityChange?: (value: string | null) => void;
  onDocumentChange?: () => void;
}

export const PassengerAmlDetailsStepForm = ({
  entityType,
  showPanRelation = false,
  onPanFieldBlur,
  onPassportNumberBlur,
  onPassportFieldBlur,
  onNationalityChange,
  onDocumentChange,
}: PassengerAmlDetailsStepFormProps) => (
  <PassengerDetailsFields
    entityType={entityType}
    showPanRelation={showPanRelation}
    onPanFieldBlur={onPanFieldBlur}
    onPassportNumberBlur={onPassportNumberBlur}
    onPassportFieldBlur={onPassportFieldBlur}
    onNationalityChange={onNationalityChange}
    onDocumentChange={onDocumentChange}
  />
);
