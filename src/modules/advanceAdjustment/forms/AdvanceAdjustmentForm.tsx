import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  useForm,
  FormProvider,
  useFormContext,
  useWatch,
  useFieldArray,
  type Resolver,
} from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useQuery } from '@tanstack/react-query';
import { Button, CardSection, Checkbox } from '@/components/ui';
import { Table, type TableColumnDef } from '@/components/ui/table';
import {
  FormFieldInput,
  FormFieldCheckbox,
  FormFieldDatePicker,
  FormFieldCategoryOption,
} from '@/components/forms';
import { CategoryOptionCodeEnum } from '@/types/categoryOptionTypes';
import { useAuth } from '@/lib/AuthContext';
import {
  useGetPartyProfile,
  usePartyProfileFilterByEntityType,
} from '@/modules/partyProfiles/hooks';
import {
  PartyProfileStatusEnum,
  type IPartyProfile,
} from '@/modules/partyProfiles/types/partyProfileTypes';
import { SelectPartyProfiles } from '@/modules/partyProfiles/components';
import { EntityPickerField } from '@/modules/purchase/components/EntityPickerField';
import { PurchaseWorkplaceFields } from '@/modules/purchase/components/PurchaseWorkplaceFields';
import { isVoucherIndividualSelection } from '@/modules/vouchers/utils';
import { transactionPoliciesApi } from '@/api/transactionPolicies';
import { getTransactionDatePolicy } from '@/modules/transactionPolicies/utils/transactionDatePolicy';
import { toDisplayDate } from '@/utils';
import { useAvailableAdvances } from '@/modules/advanceRefund/hooks';
import { useOutstandingSales } from '../hooks';
import type {
  AdvanceAdjustmentFormValues,
  AdvanceAdjustmentItemFormValue,
  CreateAdvanceAdjustmentPayload,
  OutstandingSaleForAdjustment,
} from '../types';
import { toast } from 'react-hot-toast';

const EMPTY_SALES: OutstandingSaleForAdjustment[] = [];

const schema = yup.object().shape({
  branchId: yup.string().required('Branch is required'),
  counterId: yup.string().required('Counter is required'),
  transactionDate: yup.string().required('Transaction date is required'),
  asOnDate: yup.string().required('As-on date is required'),
  partyTypeOptionId: yup.string().required('Party profile type is required'),
  partyProfileId: yup.string().required('Party Profile is required'),
  panNumber: yup
    .string()
    .trim()
    .optional()
    .test(
      'pan-format',
      'Invalid PAN format (expected 5 letters, 4 numbers, 1 letter, e.g. ABCDE1234F)',
      value =>
        !value ||
        value.length === 0 ||
        /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(value)
    ),
  panName: yup.string().optional(),
  panDob: yup.string().optional(),
  narration: yup.string().trim().required('Narration is required'),
});

interface AdvanceAdjustmentFormProps {
  onSubmit: (payload: CreateAdvanceAdjustmentPayload) => Promise<void>;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

const SelectAllHeader: React.FC<{ count: number }> = ({ count }) => {
  const form = useFormContext<AdvanceAdjustmentFormValues>();
  const items = useWatch({ control: form.control, name: 'items' }) || [];
  const allSelected =
    count > 0 && items.length === count && items.every(i => i.selected);

  const toggleSelectAll = (checked: boolean) => {
    const current = form.getValues('items') || [];
    current.forEach((item, idx) => {
      form.setValue(`items.${idx}.selected`, checked, { shouldDirty: true });
      if (checked && !parseFloat(item.adjustmentAmount)) {
        form.setValue(
          `items.${idx}.adjustmentAmount`,
          item.outstandingAmount,
          { shouldDirty: true }
        );
      }
    });
  };

  return (
    <div className="flex justify-center">
      <Checkbox
        checked={allSelected}
        onChange={toggleSelectAll}
        aria-label="Select all sales"
      />
    </div>
  );
};

const SelectRowCheckboxCell: React.FC<{
  index: number;
  outstandingAmount: string;
}> = ({ index, outstandingAmount }) => {
  const form = useFormContext<AdvanceAdjustmentFormValues>();

  return (
    <div className="flex justify-center">
      <FormFieldCheckbox
        name={`items.${index}.selected`}
        onChange={checked => {
          if (
            checked &&
            !parseFloat(form.getValues(`items.${index}.adjustmentAmount`))
          ) {
            form.setValue(
              `items.${index}.adjustmentAmount`,
              outstandingAmount,
              { shouldDirty: true }
            );
          }
        }}
      />
    </div>
  );
};

const AdjustmentAmountCell: React.FC<{
  index: number;
  outstandingAmount: string;
}> = ({ index, outstandingAmount }) => {
  const form = useFormContext<AdvanceAdjustmentFormValues>();
  const isSelected = useWatch({
    control: form.control,
    name: `items.${index}.selected`,
  });

  return (
    <div className="w-48 ml-auto">
      <FormFieldInput
        name={`items.${index}.adjustmentAmount`}
        type="number"
        step="0.01"
        min="0.01"
        max={outstandingAmount}
        disabled={!isSelected}
        valueTransform="none"
        className="text-right"
      />
    </div>
  );
};

const AdvanceAdjustmentSummaryCard: React.FC<{ totalCount: number }> = ({
  totalCount,
}) => {
  const form = useFormContext<AdvanceAdjustmentFormValues>();
  const watchedItems = useWatch({ control: form.control, name: 'items' });

  const selectedCount = (watchedItems || []).filter(i => i.selected).length;
  const totalAdjustmentAmount = useMemo(() => {
    const items = watchedItems || [];
    return items
      .filter(i => i.selected)
      .reduce((acc, curr) => acc + (parseFloat(curr.adjustmentAmount) || 0), 0);
  }, [watchedItems]);

  return (
    <div className="flex justify-between items-center p-4 bg-surface-secondary rounded-md border border-border-primary">
      <div className="text-sm text-text-secondary">
        Selected Sales:{' '}
        <span className="font-semibold text-text-primary">
          {selectedCount}
        </span>{' '}
        of {totalCount}
      </div>
      <div className="text-base font-bold text-text-primary">
        Total Adjustment Amount:{' '}
        <span className="text-primary-600 ml-2">
          ₹
          {totalAdjustmentAmount.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
          })}
        </span>
      </div>
    </div>
  );
};

const AdvanceAdjustmentSubmitButton: React.FC<{
  isSubmitting?: boolean;
  onCancel?: () => void;
}> = ({ isSubmitting, onCancel }) => {
  const form = useFormContext<AdvanceAdjustmentFormValues>();
  const watchedItems = useWatch({ control: form.control, name: 'items' });
  const totalAdjustmentAmount = useMemo(() => {
    const items = watchedItems || [];
    return items
      .filter(i => i.selected)
      .reduce((acc, curr) => acc + (parseFloat(curr.adjustmentAmount) || 0), 0);
  }, [watchedItems]);

  return (
    <div className="flex justify-end gap-3 pt-4 border-t border-border-primary">
      {onCancel && (
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      )}
      <Button
        type="submit"
        variant="default"
        loading={isSubmitting}
        disabled={isSubmitting || totalAdjustmentAmount <= 0}
      >
        Submit Advance Adjustment
      </Button>
    </div>
  );
};

export const AdvanceAdjustmentForm: React.FC<AdvanceAdjustmentFormProps> = ({
  onSubmit,
  isSubmitting,
  onCancel,
}) => {
  const { activeBranchId, activeCounterId, policyContext } = useAuth();
  const [isPartyModalOpen, setIsPartyModalOpen] = useState(false);
  const [selectedPartyProfile, setSelectedPartyProfile] =
    useState<IPartyProfile | null>(null);

  const initialTransactionDate =
    policyContext?.transactionDate || new Date().toISOString().slice(0, 10);

  const form = useForm<AdvanceAdjustmentFormValues>({
    resolver: yupResolver(
      schema
    ) as unknown as Resolver<AdvanceAdjustmentFormValues>,
    defaultValues: {
      branchId: activeBranchId || '',
      counterId: activeCounterId || '',
      transactionDate: initialTransactionDate,
      asOnDate: initialTransactionDate,
      partyTypeOptionId: '',
      partyProfileId: '',
      panNumber: '',
      panName: '',
      panDob: '',
      narration: '',
      items: [],
    },
  });

  const { setValue, handleSubmit, getValues, control } = form;

  const watchedBranchId = useWatch({ control, name: 'branchId' });
  const watchedCounterId = useWatch({ control, name: 'counterId' });
  const watchedPartyTypeOptionId = useWatch({
    control,
    name: 'partyTypeOptionId',
  });
  const watchedPartyId = useWatch({ control, name: 'partyProfileId' });
  const watchedPanNumber = useWatch({ control, name: 'panNumber' });
  const watchedAsOnDate = useWatch({ control, name: 'asOnDate' });

  const { data: branchPolicyContext } = useQuery({
    queryKey: ['policy-context', watchedBranchId],
    queryFn: () => transactionPoliciesApi.getPolicyContext(watchedBranchId),
    enabled: Boolean(watchedBranchId),
  });

  const effectivePolicyContext = branchPolicyContext ?? policyContext;
  const datePolicy = useMemo(
    () => getTransactionDatePolicy(effectivePolicyContext),
    [effectivePolicyContext]
  );

  useEffect(() => {
    if (datePolicy.defaultTransactionDate) {
      setValue('transactionDate', datePolicy.defaultTransactionDate, {
        shouldValidate: true,
      });
      setValue('asOnDate', datePolicy.defaultTransactionDate, {
        shouldValidate: true,
      });
    }
  }, [datePolicy.defaultTransactionDate, setValue]);

  const lastBranchIdRef = useRef(watchedBranchId || '');
  useEffect(() => {
    if (lastBranchIdRef.current && lastBranchIdRef.current !== watchedBranchId) {
      setValue('partyProfileId', '', {
        shouldDirty: true,
        shouldValidate: true,
      });
      setSelectedPartyProfile(null);
    }
    lastBranchIdRef.current = watchedBranchId || '';
  }, [watchedBranchId, setValue]);

  const lastPartyTypeOptionIdRef = useRef(watchedPartyTypeOptionId || '');
  useEffect(() => {
    if (
      lastPartyTypeOptionIdRef.current &&
      lastPartyTypeOptionIdRef.current !== watchedPartyTypeOptionId
    ) {
      setValue('partyProfileId', '', {
        shouldDirty: true,
        shouldValidate: true,
      });
      setSelectedPartyProfile(null);
    }
    lastPartyTypeOptionIdRef.current = watchedPartyTypeOptionId || '';
  }, [watchedPartyTypeOptionId, setValue]);

  const {
    targetPartyTypes,
    isIndividualFilter,
    entityTypeIdFilter,
    isIndividualSelection,
  } = usePartyProfileFilterByEntityType(watchedPartyTypeOptionId);

  const { data: fetchedPartyProfile } = useGetPartyProfile(
    watchedPartyId || '',
    undefined,
    Boolean(watchedPartyId)
  );

  const activeParty = useMemo(
    () => selectedPartyProfile || fetchedPartyProfile || null,
    [selectedPartyProfile, fetchedPartyProfile]
  );

  const isIndividual = Boolean(
    isIndividualSelection ||
      isVoucherIndividualSelection({
        entityType: activeParty?.entityType,
        isIndividual: activeParty?.isIndividual,
      })
  );

  const isPanDisabled = !isIndividual && Boolean(activeParty?.panNo?.trim());

  useEffect(() => {
    if (!activeParty) {
      setValue('panNumber', '');
      setValue('panName', '');
      setValue('panDob', '');
      return;
    }

    if (!isIndividual) {
      if (activeParty.panNo) {
        setValue('panNumber', activeParty.panNo.toUpperCase(), {
          shouldValidate: true,
        });
      }
      setValue('panName', activeParty.panName || activeParty.name || '');
      setValue(
        'panDob',
        activeParty.panDob ? String(activeParty.panDob).slice(0, 10) : ''
      );
      return;
    }

    // Individual: seed from party when present; user can still edit PAN.
    if (activeParty.panNo?.trim()) {
      setValue('panNumber', activeParty.panNo.toUpperCase(), {
        shouldValidate: true,
      });
    }
    if (activeParty.panName?.trim() || activeParty.name?.trim()) {
      setValue('panName', activeParty.panName || activeParty.name || '', {
        shouldDirty: false,
      });
    }
    if (activeParty.panDob) {
      setValue('panDob', String(activeParty.panDob).slice(0, 10), {
        shouldDirty: false,
      });
    }
  }, [activeParty, isIndividual, setValue]);

  const [debouncedPanNumber, setDebouncedPanNumber] = useState(
    (watchedPanNumber || '').trim().toUpperCase()
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedPanNumber((watchedPanNumber || '').trim().toUpperCase());
    }, 400);
    return () => clearTimeout(handler);
  }, [watchedPanNumber]);

  const isPanComplete = debouncedPanNumber.length === 10;
  const isPanFormatValid = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(debouncedPanNumber);

  // Same as Advance Refund: fill blank panName / panDob from receipts for this PAN.
  const { data: availableAdvancesData } = useAvailableAdvances({
    panNumber: debouncedPanNumber,
    branchId: watchedBranchId,
    asOnDate: watchedAsOnDate,
    partyProfileId: watchedPartyId || undefined,
    enabled: Boolean(
      watchedBranchId &&
        watchedAsOnDate &&
        isPanComplete &&
        isPanFormatValid
    ),
  });

  const lastSyncedPanMetaRef = useRef<string>('');
  useEffect(() => {
    const availableAdvances = availableAdvancesData ?? [];
    if (availableAdvances.length === 0) return;

    const signature = availableAdvances.map(a => a.id).join('|');
    if (signature === lastSyncedPanMetaRef.current) return;
    lastSyncedPanMetaRef.current = signature;

    const currentName = getValues('panName');
    if (!currentName || !currentName.trim()) {
      const advWithName = availableAdvances.find(a => a.panName?.trim());
      if (advWithName?.panName) {
        setValue('panName', advWithName.panName.trim(), { shouldDirty: true });
      }
    }

    const currentDob = getValues('panDob');
    if (!currentDob || !currentDob.trim()) {
      const advWithDob = availableAdvances.find(a => a.panDob);
      if (advWithDob?.panDob) {
        setValue('panDob', String(advWithDob.panDob).slice(0, 10), {
          shouldDirty: true,
        });
      }
    }
  }, [availableAdvancesData, getValues, setValue]);

  const { data: outstandingSalesResponse, isLoading: isSalesLoading } =
    useOutstandingSales({
      branchId: watchedBranchId,
      counterId: watchedCounterId,
      partyProfileId: watchedPartyId,
      asOnDate: watchedAsOnDate,
      enabled: Boolean(
        watchedBranchId &&
          watchedCounterId &&
          watchedPartyId &&
          watchedAsOnDate
      ),
    });

  const outstandingSales =
    outstandingSalesResponse?.data ?? EMPTY_SALES;

  const { fields, replace } = useFieldArray({
    control,
    name: 'items',
  });

  const lastSyncedSignatureRef = useRef<string>('');

  useEffect(() => {
    const signature = (outstandingSales || [])
      .map(s => `${s.id}:${s.outstanding}:${s.number}`)
      .join('|');

    if (signature === lastSyncedSignatureRef.current) {
      return;
    }

    lastSyncedSignatureRef.current = signature;

    if (!outstandingSales || outstandingSales.length === 0) {
      replace([]);
      return;
    }

    const currentItems = getValues('items') || [];
    const currentMap = new Map(currentItems.map(i => [i.transactionId, i]));

    const updated = outstandingSales.map(sale => {
      const existing = currentMap.get(sale.id);
      return {
        transactionId: sale.id,
        saleNumber: sale.number,
        saleDate: sale.transactionDate,
        slug: sale.slug,
        finalAmount: sale.finalAmount,
        outstandingAmount: sale.outstanding,
        adjustmentAmount: existing?.adjustmentAmount || sale.outstanding,
        selected: existing?.selected ?? true,
      };
    });

    replace(updated);
  }, [outstandingSales, replace, getValues]);

  const columns = useMemo<
    TableColumnDef<AdvanceAdjustmentItemFormValue & { id: string }>[]
  >(
    () => [
      {
        id: 'select',
        header: () => <SelectAllHeader count={fields.length} />,
        cell: ({ row }) => (
          <SelectRowCheckboxCell
            index={row.index}
            outstandingAmount={row.original.outstandingAmount}
          />
        ),
        enableSorting: false,
        meta: {
          headerClassName: 'w-12 text-center',
          cellClassName: 'w-12 text-center',
        },
      },
      {
        id: 'saleNumber',
        accessorKey: 'saleNumber',
        header: 'Sale No',
        cell: ({ row }) => (
          <span className="font-medium text-text-primary">
            {row.original.saleNumber}
          </span>
        ),
      },
      {
        id: 'saleDate',
        accessorKey: 'saleDate',
        header: 'Sale Date',
        cell: ({ row }) =>
          toDisplayDate(row.original.saleDate) || row.original.saleDate,
      },
      {
        id: 'slug',
        accessorKey: 'slug',
        header: 'Type',
        cell: ({ row }) => (
          <span className="text-sm text-text-secondary">
            {row.original.slug}
          </span>
        ),
      },
      {
        id: 'finalAmount',
        accessorKey: 'finalAmount',
        header: () => <div className="text-right">Final Amount (₹)</div>,
        cell: ({ row }) => (
          <div className="text-right">
            {Number(row.original.finalAmount).toLocaleString('en-IN', {
              minimumFractionDigits: 2,
            })}
          </div>
        ),
      },
      {
        id: 'outstandingAmount',
        accessorKey: 'outstandingAmount',
        header: () => <div className="text-right">Outstanding (₹)</div>,
        cell: ({ row }) => (
          <div className="text-right font-medium text-emerald-600">
            {Number(row.original.outstandingAmount).toLocaleString('en-IN', {
              minimumFractionDigits: 2,
            })}
          </div>
        ),
      },
      {
        id: 'adjustmentAmount',
        header: () => <div className="text-right">Adjust Amount (₹)</div>,
        cell: ({ row }) => (
          <AdjustmentAmountCell
            index={row.index}
            outstandingAmount={row.original.outstandingAmount}
          />
        ),
        meta: {
          headerClassName: 'w-52 text-right',
          cellClassName: 'w-52 text-right',
        },
      },
    ],
    [fields.length]
  );

  const onFormSubmit = async (values: AdvanceAdjustmentFormValues) => {
    const selectedRows = (values.items || []).filter(i => i.selected);
    if (selectedRows.length === 0) {
      toast.error('Please select at least one outstanding sale to adjust');
      return;
    }

    for (const row of selectedRows) {
      const adjustNum = parseFloat(row.adjustmentAmount);
      const outstandingNum = parseFloat(row.outstandingAmount);
      if (!adjustNum || adjustNum <= 0) {
        toast.error(`Invalid adjustment amount for sale ${row.saleNumber}`);
        return;
      }
      if (adjustNum > outstandingNum) {
        toast.error(
          `Adjustment amount for sale ${row.saleNumber} exceeds outstanding (₹${row.outstandingAmount})`
        );
        return;
      }
    }

    const payload: CreateAdvanceAdjustmentPayload = {
      branchId: values.branchId,
      counterId: values.counterId,
      transactionDate: values.transactionDate,
      asOnDate: values.asOnDate,
      partyProfileId: values.partyProfileId,
      panNumber: values.panNumber
        ? values.panNumber.trim().toUpperCase()
        : undefined,
      panName: values.panName?.trim() || undefined,
      panDob: values.panDob?.trim() || undefined,
      narration: values.narration.trim(),
      items: selectedRows.map(row => ({
        transactionId: row.transactionId,
        adjustmentAmount: parseFloat(row.adjustmentAmount).toFixed(2),
      })),
    };

    await onSubmit(payload);
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        <CardSection heading="Workplace & Dates">
          <div className="grid gap-4 lg:grid-cols-2">
            <PurchaseWorkplaceFields />
            <div className="grid gap-4 grid-cols-2">
              <FormFieldDatePicker
                name="transactionDate"
                label="Transaction Date (dd/mm/yyyy)"
                placeholder="DD/MM/YYYY"
                disabled={!datePolicy.canPunchTransactions}
              />
              <FormFieldDatePicker
                name="asOnDate"
                label="As-on Date (dd/mm/yyyy)"
                placeholder="DD/MM/YYYY"
              />
            </div>
          </div>
        </CardSection>

        <CardSection heading="Party & Identification">
          <div className="grid gap-4 md:grid-cols-2">
            <FormFieldCategoryOption
              name="partyTypeOptionId"
              label="Party Profile Type"
              placeholder="Select Party Type"
              code={CategoryOptionCodeEnum.EntityType}
              isCreatable={false}
              disabled={!watchedBranchId}
            />
            <div>
              <EntityPickerField
                label="Party Profile"
                value={
                  activeParty
                    ? `${activeParty.code} - ${activeParty.name}`
                    : ''
                }
                placeholder={
                  !watchedBranchId
                    ? 'Select branch first'
                    : !watchedPartyTypeOptionId
                      ? 'Select party profile type first'
                      : 'Click to select party profile'
                }
                disabled={!watchedBranchId || !watchedPartyTypeOptionId}
                onClick={() => setIsPartyModalOpen(true)}
                helperText={
                  !watchedBranchId
                    ? 'Select a branch first.'
                    : !watchedPartyTypeOptionId
                      ? 'Select a party profile type to enable party selection.'
                      : undefined
                }
              />
              {form.formState.errors.partyProfileId && (
                <p className="mt-1 text-xs text-error-600">
                  {form.formState.errors.partyProfileId.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3 mt-4">
            <div>
              <FormFieldInput
                name="panNumber"
                label="PAN Card Number"
                placeholder="e.g. ABCDE1234F"
                disabled={isPanDisabled || !activeParty}
              />
              <p className="text-xs text-text-secondary mt-1">
                {isIndividual
                  ? 'Editable for individual party'
                  : activeParty?.panNo?.trim()
                    ? 'Auto-filled from party profile'
                    : 'Optional'}
              </p>
            </div>
            <FormFieldInput
              name="panName"
              label="PAN Holder Name"
              placeholder="Full Name as per PAN"
              disabled={
                !isIndividual &&
                Boolean(activeParty?.panName || activeParty?.name)
              }
            />
            <FormFieldDatePicker
              name="panDob"
              label="PAN DOB / Inc. Date"
              placeholder="DD/MM/YYYY"
              disabled={!isIndividual && Boolean(activeParty?.panDob)}
            />
          </div>
        </CardSection>

        <SelectPartyProfiles
          open={isPartyModalOpen}
          types={targetPartyTypes}
          queryParams={{
            branchId: watchedBranchId || undefined,
            entityTypeId: entityTypeIdFilter,
            isIndividual: isIndividualFilter,
            activeOnly: true,
            status: PartyProfileStatusEnum.APPROVE,
          }}
          selectable
          multiple={false}
          title="Select Party Profile"
          description="Search and choose an approved party profile."
          initialSelectedProfiles={activeParty ? [activeParty] : []}
          onContinue={profiles => {
            const profile = profiles[0];
            if (profile) {
              setSelectedPartyProfile(profile);
              setValue('partyProfileId', profile.id, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              });
            }
            setIsPartyModalOpen(false);
          }}
          onClose={() => setIsPartyModalOpen(false)}
        />

        <CardSection heading="Narration">
          <FormFieldInput
            name="narration"
            label="Narration"
            placeholder="Enter reason for advance adjustment"
          />
        </CardSection>

        <CardSection heading="Outstanding Sales to Adjust">
          {!watchedPartyId ? (
            <p className="text-sm text-text-secondary py-6 text-center">
              Select a party profile to load outstanding sale bills.
            </p>
          ) : isSalesLoading ? (
            <p className="text-sm text-text-secondary py-6 text-center">
              Loading outstanding sales...
            </p>
          ) : fields.length === 0 ? (
            <p className="text-sm text-text-secondary py-6 text-center">
              No outstanding sale bills found for this party as of{' '}
              {toDisplayDate(watchedAsOnDate) || watchedAsOnDate}.
            </p>
          ) : (
            <div className="space-y-4">
              <Table
                data={fields}
                columns={columns}
                getRowId={row => row.id}
                enableSorting={false}
                enablePagination={false}
              />
              <AdvanceAdjustmentSummaryCard totalCount={fields.length} />
            </div>
          )}
        </CardSection>

        <AdvanceAdjustmentSubmitButton
          isSubmitting={isSubmitting}
          onCancel={onCancel}
        />
      </form>
    </FormProvider>
  );
};
