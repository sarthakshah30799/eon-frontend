import { useNavigate } from 'react-router-dom';
import { BackButton } from '@/components/ui';
import { createEmptyUserRoleFormValues } from '../utils';
import { buildUserRightsPermissionGrid } from '../utils';
import { UserRoleForm } from '../forms';
import type { ICreateUserRole } from '../types';
import { useCreateUserRole } from '../hooks';
import { USER_ROLE_TEXTS } from '../constants';
import { useUserRightsMatrix } from '../hooks';
import { UserRoleRightsSection } from '../components';
import { userRoleApi } from '@/api/userRole';

export const UserRoleCreateView = () => {
  const navigate = useNavigate();
  const { submitUserRole, isPending } = useCreateUserRole();
  const rightsMatrix = useUserRightsMatrix(null);

  const handleSubmit = async (values: ICreateUserRole) => {
    const createdRole = await submitUserRole(values);
    await userRoleApi.saveRolePermissions(
      createdRole.id,
      buildUserRightsPermissionGrid(rightsMatrix.rowStateById)
    );
    navigate('/master/system-setups/user-role');
  };

  return (
    <section className="rounded-sm border border-border-primary bg-surface-primary p-6 shadow-sm">
      <div className="mb-6 space-y-4">
        <BackButton
          onClick={() => navigate('/master/system-setups/user-role')}
          label="Back"
        />

        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-tertiary">
          System Setup
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-text-primary">
          {USER_ROLE_TEXTS.CREATE_ROLE}
        </h1>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          {USER_ROLE_TEXTS.FORM_SUBTITLE}
        </p>
      </div>

      <UserRoleForm
        defaultValues={createEmptyUserRoleFormValues()}
        onSubmit={handleSubmit}
        submitLabel={USER_ROLE_TEXTS.CREATE_ROLE}
        isSubmitting={isPending || rightsMatrix.isSaving}
      >
        <UserRoleRightsSection
          rightsTreeNodes={rightsMatrix.selectableTreeNodes}
          selectedNodeId={rightsMatrix.selectedNodeId}
          selectedNodePathIds={rightsMatrix.selectedNodePathIds}
          selectedNodeLabel={rightsMatrix.selectedNode?.label}
          visibleRows={rightsMatrix.visibleRows}
          rowStateById={rightsMatrix.rowStateById}
          onSelectNode={rightsMatrix.selectNode}
          onToggleAllRowsSelected={rightsMatrix.toggleAllRowsSelected}
          onToggleRowSelected={rightsMatrix.toggleRowSelected}
          onToggleColumnPermission={rightsMatrix.toggleColumnPermission}
          onTogglePermission={rightsMatrix.togglePermission}
          isLoading={rightsMatrix.isLoading}
          error={rightsMatrix.error}
        />
      </UserRoleForm>
    </section>
  );
};
