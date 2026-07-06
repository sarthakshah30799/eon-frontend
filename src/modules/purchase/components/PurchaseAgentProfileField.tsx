import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { SelectPartyProfiles } from '@/modules/partyProfiles/components';
import type { IPurchaseFormValues } from '../types/purchaseTypes';
import { formatPurchaseEntityLabel } from '../utils/purchaseUtils';
import { EntityPickerField } from './EntityPickerField';

export const PurchaseAgentProfileField = ({
  disabled = false,
}: {
  disabled?: boolean;
}) => {
  const form = useFormContext<IPurchaseFormValues>();
  const [open, setOpen] = useState(false);

  const agentProfileCode = form.watch('agentProfileCode');
  const agentProfileName = form.watch('agentProfileName');

  return (
    <>
      <EntityPickerField
        label="Agent Profile"
        value={formatPurchaseEntityLabel(agentProfileCode, agentProfileName)}
        placeholder="Select agent profile"
        onClick={() => setOpen(true)}
        disabled={disabled}
        helperText="Optional. Choose an agent profile if this purchase transaction needs one."
      />

      <SelectPartyProfiles
        open={open}
        types={['AGENT']}
        selectable
        multiple={false}
        title="Select Agent Profile"
        description="Choose a single agent profile for the purchase transaction."
        onContinue={profiles => {
          const selectedProfile = profiles[0];
          if (!selectedProfile) {
            return;
          }

          form.setValue('agentProfileId', selectedProfile.id, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          });
          form.setValue('agentProfileCode', selectedProfile.code, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: false,
          });
          form.setValue('agentProfileName', selectedProfile.name, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: false,
          });
          setOpen(false);
        }}
        onClose={() => setOpen(false)}
      />
    </>
  );
};

export default PurchaseAgentProfileField;
