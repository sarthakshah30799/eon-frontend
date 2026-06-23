import { useCallback, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useFormContext } from 'react-hook-form';
import { CardSection } from '@/components/ui';
import {
  Form,
  FormFieldCheckbox,
  FormFieldInput,
  FormFieldSelect,
} from '@/components/forms';
import type { ICreateUserProfile } from '../types';
import { yupResolver } from '@hookform/resolvers/yup';
import type { Resolver } from 'react-hook-form';
import { userProfileSchema } from '../schema';
import { userRoleApi, branchProfileApi, counterProfileApi } from '@/api';
import { useNavigate } from 'react-router-dom';
import { userProfileApi } from '@/api/userProfile';
import { normalizeCodeValue } from '@/utils';

interface UserProfileFormProps {
  defaultValues: ICreateUserProfile;
  onSubmit: (values: ICreateUserProfile) => void | Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
  currentId?: string;
}

const createStaticLoadOptions = (
  options: { value: string; label: string }[]
) => {
  return async () => ({
    options,
    hasMore: false,
  });
};

const UserProfileFormFields = ({
  isSubmitting,
  isEdit,
  currentId,
}: {
  isSubmitting: boolean;
  isEdit: boolean;
  submitLabel: string;
  currentId?: string;
}) => {
  const { watch, setValue } = useFormContext();
  const selectedBranchId = watch('branchId');
  const selectedRoleId = watch('roleId');

  // Load backend data dynamically
  const {
    data: roles = [],
    isLoading: isRolesLoading,
    isFetching: isRolesFetching,
  } = useQuery({
    queryKey: ['roles'],
    queryFn: () => userRoleApi.getUserRoles(),
  });

  const {
    data: branches = [],
    isLoading: isBranchesLoading,
    isFetching: isBranchesFetching,
    dataUpdatedAt: branchesUpdatedAt,
  } = useQuery({
    queryKey: ['branches'],
    queryFn: () => branchProfileApi.getBranchProfiles(),
  });

  const {
    data: counters = [],
    isLoading: isCountersLoading,
    isFetching: isCountersFetching,
    dataUpdatedAt: countersUpdatedAt,
  } = useQuery({
    queryKey: ['counters'],
    queryFn: () => counterProfileApi.getCounterProfiles(),
  });

  // Automatically update role code when role changes
  useEffect(() => {
    if (selectedRoleId && roles.length > 0) {
      const selectedRole = roles.find(r => r.id === selectedRoleId);
      if (selectedRole) {
        setValue('code', selectedRole.code);
      }
    }
  }, [selectedRoleId, roles, setValue]);

  // Automatically reset counter if branch changes
  useEffect(() => {
    if (selectedBranchId) {
      const selectedBranch = branches.find(b => b.id === selectedBranchId);
      const connectedCounterIds = selectedBranch?.connectCounterIds || [];
      const currentCounterId = watch('counterId');
      const counterIsValid = connectedCounterIds.includes(currentCounterId);
      if (!counterIsValid) {
        setValue('counterId', '');
      }
    } else {
      setValue('counterId', '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBranchId, setValue, counters, branches]);

  const branchLoadOptions = useMemo(() => {
    const opts = branches.map(b => ({
      value: b.id,
      label: b.code,
    }));
    return createStaticLoadOptions(opts);
  }, [branches]);

  const branchDefaultOptions = useMemo(
    () =>
      branches.map(b => ({
        value: b.id,
        label: b.code,
      })),
    [branches]
  );

  const roleLoadOptions = useMemo(() => {
    const opts = roles.map(r => ({
      value: r.id,
      label: r.name || r.code,
    }));
    return createStaticLoadOptions(opts);
  }, [roles]);

  const roleDefaultOptions = useMemo(
    () =>
      roles.map(r => ({
        value: r.id,
        label: r.name || r.code,
      })),
    [roles]
  );

  const counterLoadOptions = useMemo(() => {
    if (!selectedBranchId) return createStaticLoadOptions([]);
    const selectedBranch = branches.find(b => b.id === selectedBranchId);
    if (!selectedBranch) return createStaticLoadOptions([]);

    const connectedCounterIds = selectedBranch.connectCounterIds || [];
    const filtered = counters.filter(c => connectedCounterIds.includes(c.id));
    const opts = filtered.map(c => ({
      value: c.id,
      label: c.name || `Counter ${c.counterNo}`,
    }));
    return createStaticLoadOptions(opts);
  }, [counters, branches, selectedBranchId]);

  const counterDefaultOptions = useMemo(() => {
    if (!selectedBranchId) return [];
    const selectedBranch = branches.find(b => b.id === selectedBranchId);
    if (!selectedBranch) return [];

    const connectedCounterIds = selectedBranch.connectCounterIds || [];
    return counters
      .filter(c => connectedCounterIds.includes(c.id))
      .map(c => ({
        value: c.id,
        label: c.name || `Counter ${c.counterNo}`,
      }));
  }, [counters, branches, selectedBranchId]);

  const validateUserCode = useCallback(
    async (value: string) => {
      const normalizedCode = normalizeCodeValue(value);
      if (!normalizedCode) {
        return false;
      }

      const users = await userProfileApi.getUserProfiles();
      return users.some(
        user =>
          normalizeCodeValue(user.code) === normalizedCode &&
          user.id !== currentId
      );
    },
    [currentId]
  );

  return (
    <div className="space-y-6">
      {/* 1. Identity & Credentials */}
      <CardSection heading="Identity">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          <FormFieldInput
            name="code"
            label="User Code"
            disabled={isSubmitting || isEdit}
            placeholder="e.g. ADM001"
            asyncValidation={{
              enabled: !isSubmitting && !isEdit,
              check: validateUserCode,
              message: 'User code already exists',
              normalize: normalizeCodeValue,
            }}
          />
          <FormFieldInput
            name="name"
            label="User Name"
            disabled={isSubmitting}
            placeholder="Full Name"
          />
        </div>
      </CardSection>

      {/* 2. Associations */}
      <CardSection heading="Roles & Workplace Associations">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          <div className="space-y-2">
            <FormFieldSelect
              name="roleId"
              label="User Role / Group"
              placeholder="Select Role"
              loadOptions={roleLoadOptions}
              defaultOptions={roleDefaultOptions}
              isLoading={isRolesLoading || isRolesFetching}
              pagination={false}
              disabled={isSubmitting}
            />
          </div>
          <div className="hidden lg:block" /> {/* Alignment spacer */}
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
                selectedBranchId
                  ? 'Select Counter'
                  : 'Please select associated branch first'
              }
              loadOptions={counterLoadOptions}
              defaultOptions={counterDefaultOptions}
              isLoading={isCountersLoading || isCountersFetching}
              pagination={false}
              disabled={isSubmitting || !selectedBranchId}
            />
          </div>
        </div>
      </CardSection>

      {/* 3. ERP Profile Details */}
      <CardSection heading="ERP Details & Contact">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <FormFieldInput
            name="email"
            label="Email"
            type="email"
            disabled={isSubmitting}
            placeholder="e.g. sarthak@example.com"
          />
          <FormFieldInput
            name="contactNo"
            label="Contact No."
            disabled={isSubmitting}
            placeholder="Phone Number"
          />
          <FormFieldInput
            name="employeeNo"
            label="Employee No."
            disabled={isSubmitting}
            placeholder="e.g. EMP100"
          />
          <FormFieldInput
            name="designation"
            label="Designation"
            disabled={isSubmitting}
            placeholder="e.g. Regional Manager"
          />
          <FormFieldInput
            name="userLicNo"
            label="User License No."
            disabled={isSubmitting}
            placeholder="e.g. LIC-2900"
          />
        </div>
      </CardSection>

      {/* 4. Controls & Setup */}
      <CardSection heading="Account Controls">
        <div className="grid gap-4 sm:grid-cols-3">
          <FormFieldCheckbox
            name="isActive"
            label="Active Account"
            disabled={isSubmitting}
          />
          <FormFieldCheckbox
            name="isLocked"
            label="Locked"
            disabled={isSubmitting}
          />
          <FormFieldCheckbox
            name="isDormant"
            label="Dormant"
            disabled={isSubmitting}
          />
        </div>
      </CardSection>
    </div>
  );
};

export const UserProfileForm = ({
  defaultValues,
  onSubmit,
  submitLabel = 'Create User',
  isSubmitting = false,
  currentId,
}: UserProfileFormProps) => {
  const navigate = useNavigate();

  const isEdit = !!defaultValues.code;
  const onCancel = () => {
    navigate('/user-profile');
  };
  return (
    <Form
      id="user-profile-form"
      onSubmit={onSubmit}
      resolver={
        yupResolver(userProfileSchema, {
          context: { isEdit },
        }) as Resolver<ICreateUserProfile>
      }
      defaultValues={defaultValues}
      className="space-y-6"
      footer={{
        submitLabel,
        onBackClick: () => {
          void onCancel?.();
        },
        onCancel,
      }}
    >
      <UserProfileFormFields
        isSubmitting={isSubmitting}
        isEdit={isEdit}
        submitLabel={submitLabel}
        currentId={currentId}
      />
    </Form>
  );
};
