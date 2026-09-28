import type { PassengerEntityType } from '../types/passengerTypes';
import { PassengerDetailsFields } from '../components/PassengerDetailsFields';

interface PassengerAmlDetailsStepFormProps {
  entityType: PassengerEntityType;
  showPanRelation?: boolean;
  readOnly?: boolean;
  onPanFieldBlur?: () => void;
  onPassportNumberBlur?: () => void;
  onPassportFieldBlur?: () => void;
  onArrivalDateChange?: (value: string) => void;
  onDepartureDateChange?: (value: string) => void;
  onNationalityChange?: (value: string | null) => void;
  onDocumentChange?: () => void;
}

export const PassengerAmlDetailsStepForm = ({
  entityType,
  showPanRelation = false,
  readOnly = false,
  onPanFieldBlur,
  onPassportNumberBlur,
  onPassportFieldBlur,
  onArrivalDateChange,
  onDepartureDateChange,
  onNationalityChange,
  onDocumentChange,
}: PassengerAmlDetailsStepFormProps) => (
  <PassengerDetailsFields
    entityType={entityType}
    showPanRelation={showPanRelation}
    readOnly={readOnly}
    onPanFieldBlur={onPanFieldBlur}
    onPassportNumberBlur={onPassportNumberBlur}
    onPassportFieldBlur={onPassportFieldBlur}
    onArrivalDateChange={onArrivalDateChange}
    onDepartureDateChange={onDepartureDateChange}
    onNationalityChange={onNationalityChange}
    onDocumentChange={onDocumentChange}
  />
);
