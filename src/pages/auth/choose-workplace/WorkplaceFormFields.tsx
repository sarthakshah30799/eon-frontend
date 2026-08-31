import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useFormContext, useFormState, useWatch } from 'react-hook-form';
import { FormFieldSelect } from '../../../components/forms';
import { Button } from '../../../components/ui';
import type { IUserAssignment } from '../../../modules/auth/types';
import { counterProfileApi } from '@/api/counterProfile';
import {
  useGetBranchProfile,
  useLoadBranchOptions,
} from '@/modules/branchProfile/hooks';
import { CHOOSE_WORKPLACE_TEXT } from './chooseWorkplaceConstants';
import type { IWorkplaceFormValues } from './chooseWorkplaceTypes';

interface WorkplaceFormFieldsProps {
  canSelectAllBranches: boolean;
  userAssignments: IUserAssignment[];
  onLogout: () => void | Promise<void>;
}

export const WorkplaceFormFields = ({
  canSelectAllBranches,
  userAssignments,
  onLogout,
}: WorkplaceFormFieldsProps) => {
  const form = useFormContext<IWorkplaceFormValues>();
  const { isSubmitting } = useFormState({ control: form.control });
  const branchId = useWatch({ name: 'branchId', control: form.control });

  const assignmentsByBranch = useMemo(() => {
    const grouped = new Map<string, IUserAssignment[]>();

    for (const assignment of userAssignments) {
      const current = grouped.get(assignment.branchId) ?? [];
      current.push(assignment);
      grouped.set(assignment.branchId, current);
    }

    return grouped;
  }, [userAssignments]);

  const loadApiBranchOptions = useLoadBranchOptions({ activeOnly: true });
  const { data: selectedBranchProfile } = useGetBranchProfile(branchId || '');

  const { data: counterProfiles = [], isLoading: isCountersLoading } =
    useQuery({
      queryKey: ['counter-profiles-all', { activeOnly: true }],
      queryFn: () =>
        counterProfileApi.getAllCounterProfiles({ activeOnly: true }),
      enabled: canSelectAllBranches,
    });

  const visibleBranches = useMemo(
    () =>
      Array.from(assignmentsByBranch.entries()).map(
        ([assignmentBranchId, branchAssignments]) => ({
          value: assignmentBranchId,
          label: branchAssignments[0]?.branchName ?? 'Unknown Branch',
        })
      ),
    [assignmentsByBranch]
  );

  const canSelectBranch = canSelectAllBranches || visibleBranches.length > 1;
  const effectiveSelectedBranchId =
    branchId || visibleBranches[0]?.value?.toString() || '';
  const previousBranchIdRef = useRef<string>('');

  const visibleCounters = useMemo(() => {
    if (!effectiveSelectedBranchId) {
      return [];
    }

    if (canSelectAllBranches) {
      const connectedCounterIds = new Set(
        selectedBranchProfile?.connectCounterIds ?? []
      );

      return counterProfiles
        .filter(counter => connectedCounterIds.has(counter.id))
        .map(counter => ({
          value: counter.id,
          label: `${counter.counterNo} - ${counter.name}`,
        }));
    }

    const selectedBranchAssignments =
      assignmentsByBranch.get(effectiveSelectedBranchId) ?? [];
    const seen = new Set<string>();

    return selectedBranchAssignments
      .filter(assignment => {
        if (seen.has(assignment.counterId)) {
          return false;
        }
        seen.add(assignment.counterId);
        return true;
      })
      .map(assignment => ({
        value: assignment.counterId,
        label: assignment.counterName ?? '',
      }));
  }, [
    assignmentsByBranch,
    canSelectAllBranches,
    counterProfiles,
    effectiveSelectedBranchId,
    selectedBranchProfile,
  ]);

  useEffect(() => {
    if (!canSelectBranch) {
      return;
    }

    if (
      previousBranchIdRef.current &&
      previousBranchIdRef.current !== branchId
    ) {
      form.setValue('counterId', '');
    }

    previousBranchIdRef.current = branchId || '';
  }, [branchId, canSelectBranch, form]);

  useEffect(() => {
    if (!canSelectAllBranches && !branchId && visibleBranches[0]?.value) {
      form.setValue('branchId', String(visibleBranches[0].value));
    }
  }, [branchId, canSelectAllBranches, form, visibleBranches]);

  const loadBranchOptions = useCallback(
    async (inputValue: string, page = 1) => {
      if (canSelectAllBranches) {
        return loadApiBranchOptions(inputValue, page);
      }

      const normalizedInput = inputValue.trim().toLowerCase();
      return {
        options: normalizedInput
          ? visibleBranches.filter(option =>
              option.label.toLowerCase().includes(normalizedInput)
            )
          : visibleBranches,
        hasMore: false,
      };
    },
    [canSelectAllBranches, loadApiBranchOptions, visibleBranches]
  );

  const loadCounterOptions = useCallback(
    async (inputValue: string) => ({
      options: inputValue
        ? visibleCounters.filter(option =>
            option.label.toLowerCase().includes(inputValue.toLowerCase())
          )
        : visibleCounters,
      hasMore: false,
    }),
    [visibleCounters]
  );

  return (
    <div className="space-y-6">
      <FormFieldSelect
        name="branchId"
        label="Branch"
        className="!max-w-none"
        loadOptions={loadBranchOptions}
        defaultOptions={true}
        pagination={canSelectAllBranches}
        disabled={!canSelectBranch}
        isSearchable
        menuPosition="absolute"
      />
      <FormFieldSelect
        key={`counter-${effectiveSelectedBranchId || 'empty'}`}
        name="counterId"
        label="Counter"
        className="!max-w-none"
        loadOptions={loadCounterOptions}
        placeholder={
          effectiveSelectedBranchId ? 'Select Counter' : 'Select Branch first'
        }
        defaultOptions={true}
        isLoading={canSelectAllBranches && isCountersLoading}
        disabled={!effectiveSelectedBranchId}
        isSearchable
        menuPosition="absolute"
      />
      <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
        <Button type="button" onClick={onLogout} variant="link">
          {CHOOSE_WORKPLACE_TEXT.logout}
        </Button>
      </div>
      <div className="pt-2">
        <Button
          type="submit"
          className="w-full px-4 py-2"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {CHOOSE_WORKPLACE_TEXT.confirm}
        </Button>
      </div>
    </div>
  );
};
