import { useCallback, useEffect, useRef, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { FormFieldDatePicker, FormFieldInput } from '@/components/forms';
import { useGetPartyProfile } from '@/modules/partyProfiles/hooks';
import { usePassengerPassportLookup } from '@/modules/passengers/hooks';
import type { PartyProfileType } from '@/modules/partyProfiles/types';
import type { IPassengerLookupSnapshot } from '@/modules/passengers/types/passengerTypes';
import { DEAL_COVER_RATE_TEXT } from '../constants';
import type { DealCoverRateFormValues } from '../types';

const clearOptions = {
  shouldDirty: true,
  shouldTouch: true,
  shouldValidate: false,
} as const;

const quietOptions = {
  shouldDirty: false,
  shouldTouch: false,
  shouldValidate: false,
} as const;

const emptyPassengerFields = {
  passengerId: '',
  passengerName: '',
  passengerPan: '',
  passengerPanHolder: '',
  passengerPanDob: '',
  passengerPassport: '',
} as const;

interface PassengerLookupMessageOverride {
  partyId: string;
  message: string;
}

const readLookupText = (value: string | null | undefined) =>
  typeof value === 'string' ? value.trim() : '';

const resolveLookupPassengerName = (snapshot: IPassengerLookupSnapshot) =>
  readLookupText(snapshot.passportPassengerName) ||
  readLookupText(snapshot.panHolderName) ||
  readLookupText(snapshot.paidByPanHolderName);

const clearPassengerFields = (
  form: ReturnType<typeof useFormContext<DealCoverRateFormValues>>,
  options: typeof clearOptions | typeof quietOptions
) => {
  Object.entries(emptyPassengerFields).forEach(([key, value]) => {
    form.setValue(key as keyof typeof emptyPassengerFields, value, options);
  });
};

interface DealCoverPassengerSectionProps {
  readOnly?: boolean;
}

export const DealCoverPassengerSection = ({
  readOnly = false,
}: DealCoverPassengerSectionProps) => {
  const form = useFormContext<DealCoverRateFormValues>();
  const partyProfileType = useWatch({
    control: form.control,
    name: 'partyProfileType',
  });
  const partyProfileId = useWatch({
    control: form.control,
    name: 'partyProfileId',
  });
  const passengerId = useWatch({
    control: form.control,
    name: 'passengerId',
  });
  const { data: partyProfile, isLoading: partyProfileLoading } =
    useGetPartyProfile(
      partyProfileId || '',
      (partyProfileType as PartyProfileType) || undefined,
      Boolean(partyProfileId)
    );
  const { lookupIdentity, isLookingUpIdentity } = usePassengerPassportLookup();
  /** Lookup/async messages only; party-sync hints are derived below. */
  const [lookupOverride, setLookupOverride] =
    useState<PassengerLookupMessageOverride | null>(null);
  /** Tracks last applied party id so edit hydrate does not wipe saved passenger. */
  const previousPartyIdRef = useRef<string | null>(null);

  const isIndividualParty = Boolean(partyProfile?.isIndividual);
  const passengerFieldsLocked =
    readOnly ||
    !partyProfileId ||
    partyProfileLoading ||
    (Boolean(partyProfile) && !isIndividualParty);

  const lookupMessage = (() => {
    if (!partyProfileId || !partyProfile) {
      return null;
    }
    if (lookupOverride?.partyId === partyProfileId) {
      return lookupOverride.message;
    }
    if (partyProfile.isIndividual) {
      return DEAL_COVER_RATE_TEXT.passengerIndividualHint;
    }
    return DEAL_COVER_RATE_TEXT.passengerFromProfile;
  })();

  const applyProfilePassenger = useCallback(() => {
    if (!partyProfile || partyProfile.isIndividual) {
      return;
    }

    form.setValue('passengerId', '', quietOptions);
    form.setValue(
      'passengerName',
      String(partyProfile.name || partyProfile.contactName || '').trim(),
      quietOptions
    );
    form.setValue(
      'passengerPan',
      String(partyProfile.panNo || '')
        .trim()
        .toUpperCase(),
      quietOptions
    );
    form.setValue(
      'passengerPanHolder',
      String(partyProfile.panName || partyProfile.name || '').trim(),
      quietOptions
    );
    form.setValue(
      'passengerPanDob',
      partyProfile.panDob ? String(partyProfile.panDob).slice(0, 10) : '',
      quietOptions
    );
    form.setValue('passengerPassport', '', quietOptions);
  }, [form, partyProfile]);

  useEffect(() => {
    if (readOnly) {
      return;
    }

    if (!partyProfileId) {
      if (previousPartyIdRef.current) {
        clearPassengerFields(form, quietOptions);
      }
      previousPartyIdRef.current = '';
      return;
    }

    if (!partyProfile) {
      return;
    }

    const priorPartyId = previousPartyIdRef.current;
    const partyChanged =
      priorPartyId !== null &&
      priorPartyId !== '' &&
      priorPartyId !== partyProfileId;
    const isInitialBind = priorPartyId === null || priorPartyId === '';

    previousPartyIdRef.current = partyProfileId;

    if (partyProfile.isIndividual) {
      if (partyChanged) {
        clearPassengerFields(form, clearOptions);
      }
      return;
    }

    if (partyChanged || isInitialBind) {
      applyProfilePassenger();
    }
  }, [applyProfilePassenger, form, partyProfile, partyProfileId, readOnly]);

  const runIdentityLookup = useCallback(async () => {
    if (readOnly || !isIndividualParty || !partyProfileId) {
      return;
    }

    const panNumber = String(form.getValues('passengerPan') ?? '')
      .trim()
      .toUpperCase();
    const passportNumber = String(
      form.getValues('passengerPassport') ?? ''
    )
      .trim()
      .toUpperCase();

    if (!panNumber && !passportNumber) {
      form.setValue('passengerId', '', clearOptions);
      setLookupOverride({
        partyId: partyProfileId,
        message: DEAL_COVER_RATE_TEXT.passengerIndividualHint,
      });
      return;
    }

    try {
      const result = await lookupIdentity({
        panNumber: panNumber || undefined,
        passportNumber: passportNumber || undefined,
      });

      if (result.found && result.passenger) {
        const snapshot = result.passenger;
        const name = resolveLookupPassengerName(snapshot);
        const pan = readLookupText(snapshot.panNumber);
        const panHolder = readLookupText(snapshot.panHolderName);
        const panDob = readLookupText(snapshot.panDob).slice(0, 10);
        const passport = readLookupText(snapshot.passportNumber);

        if (snapshot.id) {
          form.setValue('passengerId', snapshot.id, clearOptions);
        }
        if (name) {
          form.setValue('passengerName', name, clearOptions);
        }
        if (pan) {
          form.setValue('passengerPan', pan.toUpperCase(), clearOptions);
        }
        if (panHolder) {
          form.setValue('passengerPanHolder', panHolder, clearOptions);
        }
        if (panDob) {
          form.setValue('passengerPanDob', panDob, clearOptions);
        }
        if (passport) {
          form.setValue(
            'passengerPassport',
            passport.toUpperCase(),
            clearOptions
          );
        }
        setLookupOverride({
          partyId: partyProfileId,
          message: DEAL_COVER_RATE_TEXT.passengerFound,
        });
        return;
      }

      form.setValue('passengerId', '', clearOptions);
      setLookupOverride({
        partyId: partyProfileId,
        message: DEAL_COVER_RATE_TEXT.passengerNew,
      });
    } catch (error) {
      form.setValue('passengerId', '', clearOptions);
      setLookupOverride({
        partyId: partyProfileId,
        message:
          error instanceof Error
            ? error.message
            : DEAL_COVER_RATE_TEXT.passengerLookupFailed,
      });
    }
  }, [form, isIndividualParty, lookupIdentity, partyProfileId, readOnly]);

  return (
    <div className="space-y-3">
      <div className="grid gap-4 xl:grid-cols-4">
        <FormFieldInput
          name="passengerName"
          label={DEAL_COVER_RATE_TEXT.passengerName}
          valueTransform="none"
          disabled={passengerFieldsLocked}
        />
        <FormFieldInput
          name="passengerPan"
          label={DEAL_COVER_RATE_TEXT.passengerPan}
          valueTransform="uppercase"
          disabled={passengerFieldsLocked}
          onBlur={() => {
            void runIdentityLookup();
          }}
        />
        <FormFieldInput
          name="passengerPanHolder"
          label={DEAL_COVER_RATE_TEXT.passengerPanHolder}
          valueTransform="none"
          disabled={passengerFieldsLocked}
        />
        <FormFieldDatePicker
          name="passengerPanDob"
          label={DEAL_COVER_RATE_TEXT.passengerPanDob}
          dateFormat="dd/MM/yyyy"
          disabled={passengerFieldsLocked}
        />
        <FormFieldInput
          name="passengerPassport"
          label={DEAL_COVER_RATE_TEXT.passengerPassport}
          valueTransform="uppercase"
          disabled={passengerFieldsLocked}
          onBlur={() => {
            void runIdentityLookup();
          }}
        />
      </div>
      {!partyProfileId ? (
        <p className="text-xs text-text-secondary">
          {DEAL_COVER_RATE_TEXT.passengerSelectPartyFirst}
        </p>
      ) : null}
      {partyProfileId && lookupMessage ? (
        <p className="text-xs text-text-secondary">
          {isLookingUpIdentity
            ? DEAL_COVER_RATE_TEXT.passengerLookingUp
            : lookupMessage}
          {isIndividualParty && passengerId
            ? ` (${DEAL_COVER_RATE_TEXT.passengerLinked})`
            : null}
        </p>
      ) : null}
    </div>
  );
};

export default DealCoverPassengerSection;
