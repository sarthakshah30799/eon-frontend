import { useCallback, useEffect, useMemo } from 'react';
import { useFormContext, useFormState, useWatch } from 'react-hook-form';
import { FormFieldSelect } from '../../../components/forms';
import { Button } from '../../../components/ui';
import type { IUserAssignment } from '../../../modules/auth/types';
import { useListBranchProfiles } from '@/modules/branchProfile/hooks';
import { useListCounterProfiles } from '@/modules/counterProfile/hooks';
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

  const { data: branchProfiles = [] } = useListBranchProfiles(
    { activeOnly: true },
    canSelectAllBranches
  );

  const { data: counterProfiles = [] } = useListCounterProfiles(
    { activeOnly: true },
    canSelectAllBranches
  );

  const visibleBranches = useMemo(() => {
    if (canSelectAllBranches) {
      return branchProfiles.map(branch => ({
        value: branch.id,
        label: `${branch.code} - ${branch.name}`,
      }));
    }

    return Array.from(assignmentsByBranch.entries()).map(
      ([assignmentBranchId, branchAssignments]) => ({
        value: assignmentBranchId,
        label: branchAssignments[0]?.branchName ?? 'Unknown Branch',
      })
    );
  }, [assignmentsByBranch, branchProfiles, canSelectAllBranches]);

  const effectiveSelectedBranchId = branchId || visibleBranches[0]?.value?.toString() || '';

  const visibleCounters = useMemo(() => {
    if (!effectiveSelectedBranchId) {
      return [];
    }

    if (canSelectAllBranches) {
      return counterProfiles
        .filter(counter => counter.branchId === effectiveSelectedBranchId)
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
  ]);

  useEffect(() => {
    if (!canSelectAllBranches) {
      return;
    }

    form.setValue('counterId', '');
  }, [branchId, canSelectAllBranches, form]);

  useEffect(() => {
    if (!canSelectAllBranches && !branchId && visibleBranches[0]?.value) {
      form.setValue('branchId', String(visibleBranches[0].value));
    }
  }, [branchId, canSelectAllBranches, form, visibleBranches]);

  const loadBranchOptions = useCallback(
    async (inputValue: string) => ({
      options: inputValue
        ? visibleBranches.filter(option =>
            option.label.toLowerCase().includes(inputValue.toLowerCase())
          )
        : visibleBranches,
      hasMore: false,
    }),
    [visibleBranches]
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
        loadOptions={loadBranchOptions}
        disabled={!canSelectAllBranches}
        isSearchable
        menuPosition="absolute"
      />
      <FormFieldSelect
        key={`counter-${effectiveSelectedBranchId || 'empty'}`}
        name="counterId"
        label="Counter"
        loadOptions={loadCounterOptions}
        placeholder={effectiveSelectedBranchId ? 'Select Counter' : 'Select Branch first'}
        defaultOptions
        disabled={!effectiveSelectedBranchId}
        isSearchable
        menuPosition="absolute"
      />
      <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
        <Button type="button" onClick={onLogout} variant="link">
          Log Out / Switch Account
        </Button>
      </div>
      <div className="pt-2">
        <Button
          type="submit"
          className="w-full px-4 py-2"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          Confirm & Continue
        </Button>
      </div>
    </div>
  );
};
