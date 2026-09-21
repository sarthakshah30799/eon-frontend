import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { SelectPartyProfiles } from '@/modules/partyProfiles/components';
import type { IPartyProfileListQuery } from '@/modules/partyProfiles/types';
import type { IPurchaseFormValues } from '../types/purchaseTypes';
import {
  formatPurchaseEntityLabel,
  getPurchaseTransactionPartyProfileFilter,
} from '../utils/purchaseUtils';
import { EntityPickerField } from './EntityPickerField';

export const PurchaseAgentProfileField = ({
  branchId = '',
  disabled = false,
}: {
  branchId?: string;
  disabled?: boolean;
}) => {
  const form = useFormContext<IPurchaseFormValues>();
  const [open, setOpen] = useState(false);

  const resolvedBranchId = branchId.trim();
  const isBranchMissing = !resolvedBranchId;
  const isPickerDisabled = disabled || isBranchMissing;

  const agentProfileCode = form.watch('agentProfileCode');
  const agentProfileName = form.watch('agentProfileName');
  const transactionType = form.watch('transactionType');
  const profileQueryParams = {
    ...getPurchaseTransactionPartyProfileFilter(transactionType),
    activeOnly: true,
    ...(resolvedBranchId ? { branchId: resolvedBranchId } : {}),
  } satisfies Pick<
    IPartyProfileListQuery,
    'sale' | 'purchase' | 'activeOnly' | 'branchId'
  >;

  return (
    <>
      <EntityPickerField
        label="Agent Profile"
        value={formatPurchaseEntityLabel(agentProfileCode, agentProfileName)}
        placeholder="Select agent profile"
        onClick={() => {
          if (isPickerDisabled) {
            return;
          }
          setOpen(true);
        }}
        disabled={isPickerDisabled}
        helperText="Optional. Choose an agent profile if this transaction needs one."
      />

      <SelectPartyProfiles
        open={open && !isBranchMissing}
        types={['AGENT']}
        selectable
        multiple={false}
        title="Select Agent Profile"
        description="Choose a single agent profile for the transaction."
        queryParams={profileQueryParams}
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
