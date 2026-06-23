import { useNavigate, useParams } from 'react-router-dom';
import { UserRoleForm } from '../forms';
import { useGetUserRole, useUpdateUserRole } from '../hooks';
import { USER_ROLE_TEXTS } from '../constants';
import { buildUserRightsPermissionGrid, mapRecordToFormValues } from '../utils';
import type { ICreateUserRole } from '../types';
import { Loader } from '@/components/ui/loader';
import { useUserRightsMatrix } from '../hooks';
import { UserRoleRightsSection } from '../components';
import { userRoleApi } from '@/api/userRole';

export const UserRoleEditView = () => {
  const navigate = useNavigate();
  const { id = '' } = useParams<{ id: string }>();
  const { data: role, isLoading } = useGetUserRole(id);
  const { submitUserRole, isPending } = useUpdateUserRole(id);
  const rightsMatrix = useUserRightsMatrix(id);

  if (isLoading) {
    return <Loader />;
  }

  if (!role) {
    return (
      <div className="rounded-sm border border-border-primary bg-surface-primary p-6 shadow-sm">
        <p className="text-center text-text-secondary">Role not found</p>
      </div>
    );
  }

  const handleSubmit = async (values: ICreateUserRole) => {
    await submitUserRole(values);
    await userRoleApi.saveRolePermissions(
      id,
      buildUserRightsPermissionGrid(rightsMatrix.rowStateById)
    );
    navigate('/admin/user-role');
  };

  return (
    <div className="space-y-4">
      <section className="mx-auto w-full max-w-6xl rounded-md border border-border-primary bg-surface-primary p-5 shadow-sm">
        <UserRoleForm
          defaultValues={mapRecordToFormValues(role)}
          onSubmit={handleSubmit}
          submitLabel={USER_ROLE_TEXTS.SAVE_CHANGES}
          isSubmitting={isPending || rightsMatrix.isSaving}
          currentId={id}
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
    </div>
  );
};
