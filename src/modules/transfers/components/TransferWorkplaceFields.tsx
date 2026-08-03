import { useEffect, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { FormFieldSelect } from '@/components/forms';
import { CardSection } from '@/components/ui';
import { useAuth } from '@/lib/AuthContext';
import { useListBranchProfiles } from '@/modules/branchProfile/hooks';
import { useGetCounterProfile, useListCounterProfiles } from '@/modules/counterProfile/hooks';
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

const buildBranchLabel = (branch: { code: string; name: string }) =>
  `${branch.code} - ${branch.name}`;

const buildCounterLabel = (counter: { counterNo: string; name: string }) =>
  `${counter.counterNo} - ${counter.name}`;

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

  const { data: branches = [] } = useListBranchProfiles({ activeOnly: true });
  const { data: sourceCounters = [] } = useListCounterProfiles(
    { activeOnly: true, branchId: sourceBranchId || undefined },
    Boolean(sourceBranchId)
  );
  const { data: destinationCounters = [] } = useListCounterProfiles(
    { activeOnly: true, branchId: destinationBranchId || sourceBranchId || undefined },
    Boolean(destinationBranchId || sourceBranchId)
  );
  const { data: activeCounterProfile } = useGetCounterProfile(activeCounterId || '');

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
  }, [activeBranchId, activeCounterId, form, isAdminOrHo, isCounterTransfer, readOnly]);

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
      return;
    }

    if (sourceBranchId && sourceCounterId && sourceCounters.length > 0) {
      const selectedSourceCounter = sourceCounters.find(counter => counter.id === sourceCounterId);
      if (!selectedSourceCounter) {
        form.setValue('sourceCounterId', '', {
          shouldDirty: false,
          shouldTouch: false,
          shouldValidate: false,
        });
      }
    }
  }, [form, readOnly, sourceBranchId, sourceCounterId, sourceCounters]);

  useEffect(() => {
    if (readOnly) {
      return;
    }

    if (isBranchTransfer && sourceCounterId) {
      const sourceCounter = sourceCounters.find(counter => counter.id === sourceCounterId);
      const destinationCounter = destinationCounters.find(
        counter => counter.counterNo === sourceCounter?.counterNo
      );

      if (destinationCounter) {
        form.setValue('destinationCounterId', destinationCounter.id, {
          shouldDirty: false,
          shouldTouch: false,
          shouldValidate: false,
        });
      }
    }
  }, [destinationCounters, form, isBranchTransfer, readOnly, sourceCounterId, sourceCounters]);

  useEffect(() => {
    if (readOnly) {
      return;
    }

    if (destinationBranchId && isCounterTransfer && destinationCounters.length > 0) {
      const selectedDestinationCounter = destinationCounters.find(
        counter => counter.id === form.getValues('destinationCounterId')
      );
      if (!selectedDestinationCounter) {
        form.setValue('destinationCounterId', '', {
          shouldDirty: false,
          shouldTouch: false,
          shouldValidate: false,
        });
      }
    }
  }, [destinationBranchId, destinationCounters, form, isCounterTransfer, readOnly]);

  const branchOptions = useMemo(() => {
    const options = branches.map(branch => ({
        value: branch.id,
        label: buildBranchLabel(branch),
      }));

    for (const option of [readOnlyOptions?.sourceBranch, readOnlyOptions?.destinationBranch]) {
      if (option && !options.some(existing => existing.value === option.value)) {
        options.push(option);
      }
    }

    return options;
  }, [branches, readOnlyOptions?.destinationBranch, readOnlyOptions?.sourceBranch]);

  const sourceCounterOptions = useMemo(
    () => {
      const mergedCounters = [...sourceCounters];

      if (
        activeCounterProfile &&
        !mergedCounters.some(counter => counter.id === activeCounterProfile.id)
      ) {
        mergedCounters.push(activeCounterProfile);
      }

      if (
        readOnlyOptions?.sourceCounter &&
        !mergedCounters.some(counter => counter.id === readOnlyOptions.sourceCounter?.value)
      ) {
        mergedCounters.push({
          id: readOnlyOptions.sourceCounter.value,
          counterNo: readOnlyOptions.sourceCounter.label.split(' - ')[0],
          name: readOnlyOptions.sourceCounter.label.split(' - ').slice(1).join(' - '),
        } as (typeof mergedCounters)[number]);
      }

      return mergedCounters.map(counter => ({
        value: counter.id,
        label: buildCounterLabel(counter),
      }));
    },
    [activeCounterProfile, readOnlyOptions, sourceCounters]
  );

  const sourceCounter = useMemo(
    () => sourceCounters.find(counter => counter.id === sourceCounterId) ?? null,
    [sourceCounterId, sourceCounters]
  );

  const matchingDestinationCounter = useMemo(
    () =>
      isBranchTransfer && sourceCounter
        ? destinationCounters.find(
            counter => counter.counterNo === sourceCounter.counterNo
          ) ?? null
        : null,
    [destinationCounters, isBranchTransfer, sourceCounter]
  );

  const destinationCounterOptions = useMemo(
    () => {
      const availableCounters = isBranchTransfer && matchingDestinationCounter
        ? [matchingDestinationCounter]
        : destinationCounters.filter(counter => counter.id !== sourceCounterId);

      const options = availableCounters.map(counter => ({
        value: counter.id,
        label: buildCounterLabel(counter),
      }));

      if (
        readOnlyOptions?.destinationCounter &&
        !options.some(option => option.value === readOnlyOptions.destinationCounter?.value)
      ) {
        options.push(readOnlyOptions.destinationCounter);
      }

      return options;
    },
    [
      destinationCounters,
      isBranchTransfer,
      matchingDestinationCounter,
      readOnlyOptions,
      sourceCounterId,
    ]
  );

  const canEditWorkplace = isAdminOrHo && !readOnly;
  const canEditDestination = !readOnly;

  return (
    <CardSection heading="Transfer Locations">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-4 rounded-lg border border-border-secondary bg-surface-primary p-4">
          <h3 className="text-sm font-semibold text-text-primary">Source</h3>
          <FormFieldSelect
            name="sourceBranchId"
            label="Source Branch"
            placeholder="Select source branch"
            loadOptions={async inputValue => {
              const search = inputValue.trim().toLowerCase();
              return {
                options: branchOptions.filter(option =>
                  search ? option.label.toLowerCase().includes(search) : true
                ),
              };
            }}
            defaultOptions={branchOptions}
            disabled={!canEditWorkplace}
            onValueChange={value => {
              form.setValue('sourceCounterId', '', {
                shouldDirty: true,
                shouldTouch: false,
                shouldValidate: true,
              });
              form.setValue('destinationCounterId', '', {
                shouldDirty: true,
                shouldTouch: false,
                shouldValidate: true,
              });

              if (isCounterTransfer && typeof value === 'string') {
                form.setValue('destinationBranchId', value, {
                  shouldDirty: true,
                  shouldTouch: false,
                  shouldValidate: true,
                });
                return;
              }

              if (isBranchTransfer) {
                form.setValue('destinationBranchId', '', {
                  shouldDirty: true,
                  shouldTouch: false,
                  shouldValidate: true,
                });
              }
            }}
          />
          <FormFieldSelect
            key={`source-counter-${sourceBranchId || 'empty'}`}
            name="sourceCounterId"
            label="Source Counter"
            placeholder={sourceBranchId ? 'Select source counter' : 'Select source branch first'}
            loadOptions={async inputValue => {
              const search = inputValue.trim().toLowerCase();
              return {
                options: sourceCounterOptions.filter(option =>
                  search ? option.label.toLowerCase().includes(search) : true
                ),
              };
            }}
            defaultOptions={sourceCounterOptions}
            disabled={!sourceBranchId || !canEditWorkplace}
          />
        </div>

        <div className="space-y-4 rounded-lg border border-border-secondary bg-surface-primary p-4">
          <h3 className="text-sm font-semibold text-text-primary">Destination</h3>
          {isBranchTransfer ? (
            <FormFieldSelect
              name="destinationBranchId"
              label="Destination Branch"
              placeholder="Select destination branch"
              loadOptions={async inputValue => {
                const search = inputValue.trim().toLowerCase();
                return {
                  options: branchOptions.filter(option =>
                    search ? option.label.toLowerCase().includes(search) : true
                  ),
                };
              }}
              defaultOptions={branchOptions}
              disabled={!canEditDestination}
              onValueChange={() => {
                form.setValue('destinationCounterId', '', {
                  shouldDirty: true,
                  shouldTouch: false,
                  shouldValidate: true,
                });
                if (sourceCounterId) {
                  form.setValue('destinationCounterId', sourceCounterId, {
                    shouldDirty: true,
                    shouldTouch: false,
                    shouldValidate: true,
                  });
                }
              }}
            />
          ) : (
            <div className="rounded-md border border-dashed border-border-secondary bg-surface-secondary px-3 py-2 text-sm text-text-secondary">
              Destination branch is fixed to the source branch for counter transfers.
            </div>
          )}

          <FormFieldSelect
            key={`destination-counter-${(isBranchTransfer ? sourceBranchId : destinationBranchId) || 'empty'}`}
            name="destinationCounterId"
            label="Destination Counter"
            placeholder={
              (isBranchTransfer ? sourceBranchId : destinationBranchId)
                ? isBranchTransfer
                  ? 'Source counter is auto-selected'
                  : 'Select destination counter'
                : 'Select source branch first'
            }
            loadOptions={async inputValue => {
              const search = inputValue.trim().toLowerCase();
              return {
                options: destinationCounterOptions.filter(option =>
                  search ? option.label.toLowerCase().includes(search) : true
                ),
              };
            }}
            defaultOptions={destinationCounterOptions}
            disabled={
              readOnly ||
              !sourceBranchId ||
              (isBranchTransfer && Boolean(matchingDestinationCounter)) ||
              (isCounterTransfer && !destinationBranchId)
            }
          />
          {isBranchTransfer && sourceCounterId && !matchingDestinationCounter ? (
            <p className="text-sm text-amber-700">
              The same counter is not available on the destination branch. Select a destination counter manually.
            </p>
          ) : null}
        </div>
      </div>
    </CardSection>
  );
};

export default TransferWorkplaceFields;
