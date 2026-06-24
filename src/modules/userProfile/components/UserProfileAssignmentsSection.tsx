import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { branchProfileApi, counterProfileApi, userRoleApi } from '@/api';
import {
  Button,
  CardSection,
  Table,
  type TableColumnDef,
} from '@/components/ui';
import { FormFieldSelect } from '@/components/forms';
import type {
  ICreateUserProfile,
  IUserProfileAssignment,
  IUserProfileOption,
} from '../types';

interface UserProfileAssignmentsSectionProps {
  isSubmitting: boolean;
}

interface AssignmentRow {
  id: string;
  roleLabel: string;
  branchLabel: string;
  counterLabel: string;
}

const createStaticLoadOptions = (options: IUserProfileOption[]) => {
  return async (inputValue: string) => {
    const normalizedValue = inputValue.trim().toLowerCase();
    const filteredOptions = normalizedValue
      ? options.filter(option =>
          option.label.toLowerCase().includes(normalizedValue)
        )
      : options;

    return {
      options: filteredOptions,
      hasMore: false,
    };
  };
};

const getOptionLabel = (options: IUserProfileOption[], value: string) => {
  return options.find(option => option.value === value)?.label ?? value;
};

export const UserProfileAssignmentsSection = ({
  isSubmitting,
}: UserProfileAssignmentsSectionProps) => {
  const { control, setValue } = useFormContext<ICreateUserProfile>();
  const {
    fields: assignmentFields,
    append,
    update,
    remove,
  } = useFieldArray({
    control,
    name: 'assignments',
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const selectedRoleId = useWatch({ control, name: 'roleId' }) || '';
  const selectedBranchId = useWatch({ control, name: 'branchId' }) || '';
  const selectedCounterId = useWatch({ control, name: 'counterId' }) || '';

  const {
    data: roles = [],
    isLoading: isRolesLoading,
    isFetching: isRolesFetching,
  } = useQuery({
    queryKey: ['user-profile-role-options'],
    queryFn: async () => userRoleApi.getUserRoles(),
  });

  const {
    data: branches = [],
    isLoading: isBranchesLoading,
    isFetching: isBranchesFetching,
    dataUpdatedAt: branchesUpdatedAt,
  } = useQuery({
    queryKey: ['user-profile-branch-options'],
    queryFn: async () => branchProfileApi.getBranchProfiles(),
  });

  const {
    data: counters = [],
    isLoading: isCountersLoading,
    isFetching: isCountersFetching,
    dataUpdatedAt: countersUpdatedAt,
  } = useQuery({
    queryKey: ['user-profile-counter-options'],
    queryFn: async () => counterProfileApi.getCounterProfiles(),
  });

  const roleOptions = useMemo(
    () =>
      roles.map(role => ({
        value: role.id,
        label: role.name || role.code,
      })),
    [roles]
  );

  const branchOptions = useMemo(
    () =>
      branches.map(branch => ({
        value: branch.id,
        label: branch.name,
      })),
    [branches]
  );

  const counterOptions = useMemo(() => {
    if (!selectedBranchId) {
      return [];
    }
    const selectedBranch = branches.find(
      branch => branch.id === selectedBranchId
    );
    const connectedCounterIds = selectedBranch?.connectCounterIds || [];

    return counters
      .filter(counter => connectedCounterIds.includes(counter.id))
      .map(counter => ({
        value: counter.id,
        label: counter.name || `Counter ${counter.counterNo}`,
      }));
  }, [branches, counters, selectedBranchId]);

  const roleLoadOptions = useMemo(
    () => createStaticLoadOptions(roleOptions),
    [roleOptions]
  );
  const branchLoadOptions = useMemo(
    () => createStaticLoadOptions(branchOptions),
    [branchOptions]
  );
  const counterLoadOptions = useMemo(
    () => createStaticLoadOptions(counterOptions),
    [counterOptions]
  );
  const roleDefaultOptions = roleOptions;
  const branchDefaultOptions = branchOptions;
  const counterDefaultOptions = counterOptions;

  useEffect(() => {
    if (!selectedBranchId) {
      if (selectedCounterId) {
        setValue('counterId', '');
      }
      return;
    }

    const selectedBranch = branches.find(
      branch => branch.id === selectedBranchId
    );
    if (!selectedBranch) {
      return;
    }

    const connectedCounterIds = selectedBranch.connectCounterIds || [];

    if (selectedCounterId && !connectedCounterIds.includes(selectedCounterId)) {
      setValue('counterId', '');
    }
  }, [branches, selectedBranchId, selectedCounterId, setValue]);

  const clearEditor = () => {
    setEditingIndex(null);
    setValue('roleId', '');
    setValue('branchId', '');
    setValue('counterId', '');
  };

  const handleSaveAssignment = () => {
    if (!selectedRoleId || !selectedBranchId || !selectedCounterId) {
      return;
    }

    const nextAssignment: IUserProfileAssignment = {
      roleId: selectedRoleId,
      roleLabel: getOptionLabel(roleOptions, selectedRoleId),
      branchId: selectedBranchId,
      branchLabel: getOptionLabel(branchOptions, selectedBranchId),
      counterId: selectedCounterId,
      counterLabel: getOptionLabel(counterOptions, selectedCounterId),
    };

    if (editingIndex === null) {
      append(nextAssignment, { shouldFocus: false });
    } else {
      update(editingIndex, nextAssignment);
    }

    clearEditor();
  };

  const handleEditAssignment = (index: number) => {
    const assignment = assignmentFields[index] as unknown as
      | IUserProfileAssignment
      | undefined;
    if (!assignment) {
      return;
    }

    setEditingIndex(index);
    setValue('roleId', assignment.roleId);
    setValue('branchId', assignment.branchId);
    setValue('counterId', assignment.counterId);
  };

  const handleDeleteAssignment = (index: number) => {
    remove(index);

    if (editingIndex === index) {
      clearEditor();
    } else if (editingIndex !== null && index < editingIndex) {
      setEditingIndex(editingIndex - 1);
    }
  };

  const rows: AssignmentRow[] = useMemo(
    () =>
      assignmentFields.map(assignment => ({
        id: assignment.id,
        roleLabel:
          (assignment as unknown as IUserProfileAssignment).roleLabel ||
          (assignment as unknown as IUserProfileAssignment).roleId,
        branchLabel:
          (assignment as unknown as IUserProfileAssignment).branchLabel ||
          (assignment as unknown as IUserProfileAssignment).branchId,
        counterLabel:
          (assignment as unknown as IUserProfileAssignment).counterLabel ||
          (assignment as unknown as IUserProfileAssignment).counterId,
      })),
    [assignmentFields]
  );

  const columns: TableColumnDef<AssignmentRow>[] = [
    { accessorKey: 'branchLabel', header: 'Associated Branch' },
    { accessorKey: 'counterLabel', header: 'Associated Counter' },
    { accessorKey: 'roleLabel', header: 'User Role' },
    {
      id: 'actions',
      header: 'Actions',
      meta: {
        headerClassName:
          'sticky right-0 z-20 border-l border-border-primary bg-surface-secondary',
        cellClassName:
          'sticky right-0 z-10 border-l border-border-primary bg-surface-primary',
      },
      cell: ({ row }) => {
        const index = row.index;

        return (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              aria-label="Edit assignment"
              variant="ghost"
              size="icon"
              className="rounded-sm bg-transparent text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
              onClick={event => {
                event.stopPropagation();
                handleEditAssignment(index);
              }}
            >
              <PencilSquareIcon className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              aria-label="Delete assignment"
              variant="ghost"
              size="icon"
              className="rounded-sm bg-transparent text-text-secondary hover:bg-surface-secondary hover:text-error-600"
              onClick={event => {
                event.stopPropagation();
                handleDeleteAssignment(index);
              }}
            >
              <TrashIcon className="h-5 w-5" />
            </Button>
          </div>
        );
      },
      enableSorting: false,
    },
  ];

  const canSaveAssignment = Boolean(
    selectedRoleId && selectedBranchId && selectedCounterId
  );
  const buttonLabel = editingIndex === null ? 'Assign' : 'Save Changes';

  return (
    <CardSection heading="Role Assignments">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <FormFieldSelect
            key={`branch-select-${branchesUpdatedAt || 'loading'}`}
            name="branchId"
            label="Associated Branch"
            placeholder="Select Branch"
            loadOptions={branchLoadOptions}
            defaultOptions={branchDefaultOptions}
            isLoading={isBranchesLoading || isBranchesFetching}
            pagination={false}
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <FormFieldSelect
            key={`counter-select-${selectedBranchId || 'no-branch'}-${countersUpdatedAt || 'loading'}`}
            name="counterId"
            label="Associated Counter"
            placeholder={
              selectedBranchId ? 'Select Counter' : 'Select branch first'
            }
            loadOptions={counterLoadOptions}
            defaultOptions={counterDefaultOptions}
            isLoading={isCountersLoading || isCountersFetching}
            pagination={false}
            disabled={isSubmitting || !selectedBranchId}
          />
        </div>
        <div className="space-y-2">
          <FormFieldSelect
            name="roleId"
            label="User Role"
            placeholder="Select Role"
            loadOptions={roleLoadOptions}
            defaultOptions={roleDefaultOptions}
            isLoading={isRolesLoading || isRolesFetching}
            pagination={false}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Button
          type="button"
          variant={editingIndex === null ? 'default' : 'outline'}
          disabled={isSubmitting || !canSaveAssignment}
          onClick={handleSaveAssignment}
        >
          {buttonLabel}
        </Button>
      </div>

      <div className="mt-4">
        <Table
          columns={columns}
          data={rows}
          enableFiltering={false}
          enablePagination={false}
          enableRowSelection={false}
          enableColumnVisibility={false}
          emptyMessage="No role assignments added yet."
        />
      </div>
    </CardSection>
  );
};
