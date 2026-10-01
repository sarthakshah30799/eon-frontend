import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useFormContext, useWatch } from 'react-hook-form';
import { FormFieldSelect } from '@/components/forms';
import { CardSection } from '@/components/ui';
import { useAuth } from '@/lib/AuthContext';
import { counterProfileApi } from '@/api/counterProfile';
import { useLoadBranchOptions } from '@/modules/branchProfile/hooks';
import { useGetCounterProfile } from '@/modules/counterProfile/hooks';
import type { ITransferFormValues, TransferType } from '../types';

interface TransferWorkplaceFieldsProps {
  transferType: TransferType;
  readOnly?: boolean;
  readOnlyOptions?: TransferWorkplaceReferenceOptions;
}

export interface TransferWorkplaceReferenceOption {
  value: string;
  label: string;
}

export interface TransferWorkplaceReferenceOptions {
  sourceBranch?: TransferWorkplaceReferenceOption;
  sourceCounter?: TransferWorkplaceReferenceOption;
  destinationBranch?: TransferWorkplaceReferenceOption;
  destinationCounter?: TransferWorkplaceReferenceOption;
}

const buildCounterLabel = (counter: { counterNo: string; name: string }) =>
  `${counter.counterNo} - ${counter.name}`;

const quietResetOptions = {
  shouldDirty: true,
  shouldTouch: false,
  shouldValidate: false,
} as const;

export const TransferWorkplaceFields = ({
  transferType,
  readOnly = false,
  readOnlyOptions,
}: TransferWorkplaceFieldsProps) => {
  const form = useFormContext<ITransferFormValues>();
  const { user, activeBranchId, activeCounterId } = useAuth();
  const isAdminOrHo = Boolean(user?.isAdmin || user?.isHo || user?.isHoStaff);
  const isBranchTransfer = transferType === 'BRANCH';
  const isCounterTransfer = transferType === 'COUNTER';
  const previousSourceBranchIdRef = useRef<string>('');
  const previousDestinationBranchIdRef = useRef<string>('');
  const destinationAutoSelectSignatureRef = useRef<string>('');

  const sourceBranchId = useWatch({
    control: form.control,
    name: 'sourceBranchId',
  });
  const sourceCounterId = useWatch({
    control: form.control,
    name: 'sourceCounterId',
  });
  const destinationBranchId = useWatch({
    control: form.control,
    name: 'destinationBranchId',
  });
  const destinationCounterId = useWatch({
    control: form.control,
    name: 'destinationCounterId',
  });

  const loadBranchOptions = useLoadBranchOptions({ activeOnly: true });
  const { data: sourceCounters = [], isLoading: isSourceCountersLoading } =
    useQuery({
      queryKey: [
        'counter-profiles-all',
        { activeOnly: true, branchId: sourceBranchId },
      ],
      queryFn: () =>
        counterProfileApi.getAllCounterProfiles({
          activeOnly: true,
          branchId: sourceBranchId || undefined,
        }),
      enabled: Boolean(sourceBranchId),
    });
  const {
    data: destinationCounters = [],
    isLoading: isDestinationCountersLoading,
  } = useQuery({
    queryKey: [
      'counter-profiles-all',
      { activeOnly: true, branchId: destinationBranchId },
    ],
    queryFn: () =>
      counterProfileApi.getAllCounterProfiles({
        activeOnly: true,
        branchId: destinationBranchId || undefined,
      }),
    enabled: Boolean(destinationBranchId),
  });
  const { data: activeCounterProfile } = useGetCounterProfile(
    activeCounterId || ''
  );

  useEffect(() => {
    if (readOnly) {
      return;
    }

    if (!isAdminOrHo) {
      if (activeBranchId) {
        form.setValue('sourceBranchId', activeBranchId, {
          shouldDirty: false,
          shouldTouch: false,
          shouldValidate: false,
        });
      }

      if (activeCounterId) {
        form.setValue('sourceCounterId', activeCounterId, {
          shouldDirty: false,
          shouldTouch: false,
          shouldValidate: false,
        });
      }

      if (isCounterTransfer && activeBranchId) {
        form.setValue('destinationBranchId', activeBranchId, {
          shouldDirty: false,
          shouldTouch: false,
          shouldValidate: false,
        });
      }
    }
  }, [
    activeBranchId,
    activeCounterId,
    form,
    isAdminOrHo,
    isCounterTransfer,
    readOnly,
  ]);

  useEffect(() => {
    if (readOnly) {
      return;
    }

    if (isCounterTransfer && sourceBranchId) {
      form.setValue('destinationBranchId', sourceBranchId, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
    }
  }, [form, isCounterTransfer, readOnly, sourceBranchId]);

  useEffect(() => {
    if (readOnly) {
      previousSourceBranchIdRef.current = sourceBranchId || '';
      return;
    }

    if (
      previousSourceBranchIdRef.current &&
      previousSourceBranchIdRef.current !== sourceBranchId
    ) {
      form.setValue('sourceCounterId', '', quietResetOptions);
      form.clearErrors('sourceCounterId');
      destinationAutoSelectSignatureRef.current = '';

      if (isBranchTransfer) {
        form.setValue('destinationBranchId', '', quietResetOptions);
        form.setValue('destinationCounterId', '', quietResetOptions);
        form.clearErrors(['destinationBranchId', 'destinationCounterId']);
      } else {
        form.setValue('destinationCounterId', '', quietResetOptions);
        form.clearErrors('destinationCounterId');
      }
    }

    previousSourceBranchIdRef.current = sourceBranchId || '';
  }, [form, isBranchTransfer, readOnly, sourceBranchId]);

  useEffect(() => {
    if (readOnly) {
      previousDestinationBranchIdRef.current = destinationBranchId || '';
      return;
    }

    if (
      previousDestinationBranchIdRef.current &&
      previousDestinationBranchIdRef.current !== destinationBranchId
    ) {
      form.setValue('destinationCounterId', '', quietResetOptions);
      form.clearErrors('destinationCounterId');
    }

    previousDestinationBranchIdRef.current = destinationBranchId || '';
  }, [destinationBranchId, form, readOnly]);

  useEffect(() => {
    if (readOnly) {
      return;
    }

    if (sourceBranchId && sourceCounterId && sourceCounters.length > 0) {
      const selectedSourceCounter = sourceCounters.find(
        counter => counter.id === sourceCounterId
      );
      if (!selectedSourceCounter) {
        form.setValue('sourceCounterId', '', quietResetOptions);
        form.clearErrors('sourceCounterId');
      }
    }
  }, [form, readOnly, sourceBranchId, sourceCounterId, sourceCounters]);

  useEffect(() => {
    if (readOnly || !isBranchTransfer) {
      return;
    }

    // Do not prefill destination counter until a destination branch is chosen.
    if (!destinationBranchId || !sourceCounterId) {
      if (!destinationBranchId) {
        destinationAutoSelectSignatureRef.current = '';
      }
      return;
    }

    if (isDestinationCountersLoading || destinationCounters.length === 0) {
      return;
    }

    const sourceCounter = sourceCounters.find(
      counter => counter.id === sourceCounterId
    );
    if (!sourceCounter) {
      return;
    }

    const signature = `${destinationBranchId}|${sourceCounterId}`;
    if (destinationAutoSelectSignatureRef.current === signature) {
      if (
        destinationCounterId &&
        !destinationCounters.some(counter => counter.id === destinationCounterId)
      ) {
        form.setValue('destinationCounterId', '', quietResetOptions);
        form.clearErrors('destinationCounterId');
      }
      return;
    }

    destinationAutoSelectSignatureRef.current = signature;

    const matchingCounter = destinationCounters.find(
      counter => counter.counterNo === sourceCounter.counterNo
    );

    if (matchingCounter) {
      form.setValue('destinationCounterId', matchingCounter.id, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
      form.clearErrors('destinationCounterId');
      return;
    }

    form.setValue('destinationCounterId', '', quietResetOptions);
    form.clearErrors('destinationCounterId');
  }, [
    destinationBranchId,
    destinationCounterId,
    destinationCounters,
    form,
    isBranchTransfer,
    isDestinationCountersLoading,
    readOnly,
    sourceCounterId,
    sourceCounters,
  ]);

  useEffect(() => {
    if (readOnly) {
      return;
    }

    if (
      destinationBranchId &&
      isCounterTransfer &&
      destinationCounters.length > 0
    ) {
      const selectedDestinationCounter = destinationCounters.find(
        counter => counter.id === form.getValues('destinationCounterId')
      );
      if (!selectedDestinationCounter) {
        form.setValue('destinationCounterId', '', quietResetOptions);
        form.clearErrors('destinationCounterId');
      }
    }
  }, [
    destinationBranchId,
    destinationCounters,
    form,
    isCounterTransfer,
    readOnly,
  ]);

  const mergeBranchOptions = useCallback(
    async (
      inputValue: string,
      page = 1,
      extraOptions: Array<TransferWorkplaceReferenceOption | undefined> = [],
      excludeValue?: string
    ) => {
      const result = await loadBranchOptions(inputValue, page);
      const extras = extraOptions.filter(
        (option): option is TransferWorkplaceReferenceOption => Boolean(option)
      );
      const options = result.options.filter(
        option => option.value !== excludeValue
      );

      if (page === 1) {
        for (const extra of extras) {
          if (
            extra.value !== excludeValue &&
            !options.some(existing => existing.value === extra.value)
          ) {
            options.unshift(extra);
          }
        }
      }

      return {
        options,
        hasMore: result.hasMore,
      };
    },
    [loadBranchOptions]
  );

  const loadSourceBranchOptions = useCallback(
    (inputValue: string, page = 1) =>
      mergeBranchOptions(inputValue, page, [readOnlyOptions?.sourceBranch]),
    [mergeBranchOptions, readOnlyOptions?.sourceBranch]
  );

  const loadDestinationBranchOptions = useCallback(
    (inputValue: string, page = 1) =>
      mergeBranchOptions(
        inputValue,
        page,
        [readOnlyOptions?.destinationBranch],
        sourceBranchId || undefined
      ),
    [mergeBranchOptions, readOnlyOptions?.destinationBranch, sourceBranchId]
  );

  const sourceCounterOptions = useMemo(() => {
    const mergedCounters = [...sourceCounters];

    if (
      activeCounterProfile &&
      !mergedCounters.some(counter => counter.id === activeCounterProfile.id)
    ) {
      mergedCounters.push(activeCounterProfile);
    }

    if (
      readOnlyOptions?.sourceCounter &&
      !mergedCounters.some(
        counter => counter.id === readOnlyOptions.sourceCounter?.value
      )
    ) {
      mergedCounters.push({
        id: readOnlyOptions.sourceCounter.value,
        counterNo: readOnlyOptions.sourceCounter.label.split(' - ')[0],
        name: readOnlyOptions.sourceCounter.label
          .split(' - ')
          .slice(1)
          .join(' - '),
      } as (typeof mergedCounters)[number]);
    }

    return mergedCounters.map(counter => ({
      value: counter.id,
      label: buildCounterLabel(counter),
    }));
  }, [activeCounterProfile, readOnlyOptions, sourceCounters]);

  const sourceCounter = useMemo(
    () =>
      sourceCounters.find(counter => counter.id === sourceCounterId) ?? null,
    [sourceCounterId, sourceCounters]
  );

  const matchingDestinationCounter = useMemo(
    () =>
      isBranchTransfer && sourceCounter && destinationBranchId
        ? (destinationCounters.find(
            counter => counter.counterNo === sourceCounter.counterNo
          ) ?? null)
        : null,
    [
      destinationBranchId,
      destinationCounters,
      isBranchTransfer,
      sourceCounter,
    ]
  );

  const destinationCounterOptions = useMemo(() => {
    const availableCounters = isCounterTransfer
      ? destinationCounters.filter(counter => counter.id !== sourceCounterId)
      : destinationCounters;

    const options = availableCounters.map(counter => ({
      value: counter.id,
      label: buildCounterLabel(counter),
    }));

    if (
      readOnlyOptions?.destinationCounter &&
      !options.some(
        option => option.value === readOnlyOptions.destinationCounter?.value
      )
    ) {
      options.push(readOnlyOptions.destinationCounter);
    }

    return options;
  }, [
    destinationCounters,
    isCounterTransfer,
    readOnlyOptions,
    sourceCounterId,
  ]);

  const canEditWorkplace = isAdminOrHo && !readOnly;
  const canEditDestination = !readOnly;
  const destinationCounterPlaceholder = isBranchTransfer
    ? destinationBranchId
      ? 'Select destination counter'
      : 'Select destination branch first'
    : sourceBranchId
      ? 'Select destination counter'
      : 'Select source branch first';

  return (
    <CardSection heading="Transfer Locations">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-4 rounded-lg border border-border-secondary bg-surface-primary p-4">
          <h3 className="text-sm font-semibold text-text-primary">Source</h3>
          <FormFieldSelect
            name="sourceBranchId"
            label="Source Branch"
            placeholder="Select source branch"
            loadOptions={loadSourceBranchOptions}
            defaultOptions={true}
            pagination
            disabled={!canEditWorkplace}
            onValueChange={value => {
              if (isCounterTransfer && typeof value === 'string') {
                form.setValue('destinationBranchId', value, quietResetOptions);
                form.clearErrors('destinationBranchId');
              }

              if (isBranchTransfer) {
                form.setValue('destinationBranchId', '', quietResetOptions);
                form.clearErrors('destinationBranchId');
              }
            }}
          />
          <FormFieldSelect
            key={`source-counter-${sourceBranchId || 'empty'}`}
            name="sourceCounterId"
            label="Source Counter"
            placeholder={
              sourceBranchId
                ? 'Select source counter'
                : 'Select source branch first'
            }
            loadOptions={async inputValue => {
              const search = inputValue.trim().toLowerCase();
              return {
                options: sourceCounterOptions.filter(option =>
                  search ? option.label.toLowerCase().includes(search) : true
                ),
              };
            }}
            defaultOptions={sourceCounterOptions}
            isLoading={Boolean(sourceBranchId) && isSourceCountersLoading}
            disabled={!sourceBranchId || !canEditWorkplace}
          />
        </div>

        <div className="space-y-4 rounded-lg border border-border-secondary bg-surface-primary p-4">
          <h3 className="text-sm font-semibold text-text-primary">
            Destination
          </h3>
          {isBranchTransfer ? (
            <FormFieldSelect
              name="destinationBranchId"
              label="Destination Branch"
              placeholder="Select destination branch"
              loadOptions={loadDestinationBranchOptions}
              defaultOptions={true}
              pagination
              disabled={!canEditDestination}
            />
          ) : (
            <div className="rounded-md border border-dashed border-border-secondary bg-surface-secondary px-3 py-2 text-sm text-text-secondary">
              Destination branch is fixed to the source branch for counter
              transfers.
            </div>
          )}

          <FormFieldSelect
            key={`destination-counter-${destinationBranchId || 'empty'}`}
            name="destinationCounterId"
            label="Destination Counter"
            placeholder={destinationCounterPlaceholder}
            loadOptions={async inputValue => {
              const search = inputValue.trim().toLowerCase();
              return {
                options: destinationCounterOptions.filter(option =>
                  search ? option.label.toLowerCase().includes(search) : true
                ),
              };
            }}
            defaultOptions={destinationCounterOptions}
            isLoading={
              Boolean(destinationBranchId) && isDestinationCountersLoading
            }
            disabled={
              readOnly ||
              (isBranchTransfer
                ? !destinationBranchId
                : !sourceBranchId || !destinationBranchId)
            }
          />
          {isBranchTransfer &&
          destinationBranchId &&
          sourceCounterId &&
          !isDestinationCountersLoading &&
          !matchingDestinationCounter ? (
            <p className="text-sm text-amber-700">
              The same counter is not available on the destination branch.
              Select a destination counter manually.
            </p>
          ) : null}
        </div>
      </div>
    </CardSection>
  );
};

export default TransferWorkplaceFields;
