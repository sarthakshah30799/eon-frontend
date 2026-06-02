import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button1';
import { useDeleteUserRole, useListUserRoles, useUpdateUserRoleStatus } from '../hooks';
import { USER_ROLE_TEXTS } from '../constants';
import { UserRoleTable, UserRightsTable, UserRightsTreePreview } from '../components';
import { useUserRightsMatrix } from '../hooks';
import { Loader } from '@/components/ui/loader';
import { useState } from 'react';


export const UserRoleListView = () => {
  const navigate = useNavigate();
  const { data: roles = [], isLoading, error } = useListUserRoles();
  const { deleteUserRole, isPending: isDeleting } = useDeleteUserRole();
  const { updateUserRoleStatus, isPending: isUpdatingStatus } =
    useUpdateUserRoleStatus();

  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const activeRoleId = selectedRoleId ?? roles[0]?.id ?? null;

  const {
    selectableTreeNodes: rightsTreeNodes,
    selectedNodeId,
    selectedNode,
    selectedNodePathIds,
    visibleRows: rightsRows,
    rowStateById,
    selectNode,
    toggleAllRowsSelected,
    toggleRowSelected,
    togglePermission,
    toggleColumnPermission,
    isLoading: isLoadingMenuTree,
    error: menuTreeError,
    savePermissions,
    isSaving,
  } = useUserRightsMatrix(activeRoleId);

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this role?');
    if (confirmDelete) {
      await deleteUserRole(id);
    }
  };

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    await updateUserRoleStatus({ id, isActive });
  };

  if (isLoading) {
    return (
      <Loader />
    );
  }

  if (error) {
    return (
      <div className="py-6 text-center text-error-600">
        {USER_ROLE_TEXTS.LIST_ERROR}
      </div>
    );
  }

  if (menuTreeError) {
    return (
      <div className="py-6 text-center text-error-600">
        Unable to load user rights options.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-sm border border-border-primary bg-surface-primary p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-tertiary">
              System Setup
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-text-primary">
              {USER_ROLE_TEXTS.LIST_TITLE}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
              {USER_ROLE_TEXTS.LIST_SUBTITLE}
            </p>
          </div>

          <Button
            type="button"
            onClick={() => navigate('/master/system-setups/user-role/create')}
          >
            {USER_ROLE_TEXTS.CREATE_ROLE}
          </Button>
        </div>
      </section>

      <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
        <UserRoleTable
          roles={roles}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDelete}
          isUpdatingStatus={isUpdatingStatus}
          isDeleting={isDeleting}
          selectedRoleId={selectedRoleId}
          onSelectRole={setSelectedRoleId}
        />
      </section>

      <section className="space-y-6 rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-tertiary">
              {USER_ROLE_TEXTS.RIGHTS_TITLE}
            </p>
            <h2 className="mt-2 text-xl font-semibold text-text-primary flex items-center gap-2">
              {USER_ROLE_TEXTS.RIGHTS_TITLE}
              {activeRoleId && roles.length > 0 && (
                <span className="text-sm font-normal text-text-secondary">
                  for: <strong className="font-semibold text-primary-600">{roles.find(r => r.id === activeRoleId)?.name}</strong>
                </span>
              )}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">
              {USER_ROLE_TEXTS.RIGHTS_SUBTITLE}
            </p>
          </div>
          {activeRoleId && (
            <Button
              type="button"
              onClick={savePermissions}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Permissions'}
            </Button>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="rounded-sm border border-border-primary bg-surface-secondary p-4">
            {isLoadingMenuTree ? (
              <p className="text-sm text-text-secondary">Loading options...</p>
            ) : (
              <UserRightsTreePreview
                nodes={rightsTreeNodes}
                selectedNodeId={selectedNodeId}
                selectedNodePathIds={selectedNodePathIds}
                onSelectNode={selectNode}
              />
            )}
          </div>

          <div className="overflow-hidden rounded-sm border border-border-primary bg-surface-secondary p-4">
            <div className="mb-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-text-tertiary">
                Available Options
              </h3>
              <p className="mt-1 text-sm text-text-secondary">
                {selectedNode?.label ?? 'Select a sidebar option'}
              </p>
            </div>

            <UserRightsTable
              rows={rightsRows}
              rowStateById={rowStateById}
              onToggleAllRowsSelected={toggleAllRowsSelected}
              onToggleRowSelected={toggleRowSelected}
              onToggleColumnPermission={toggleColumnPermission}
              onTogglePermission={togglePermission}
            />
          </div>
        </div>
      </section>
    </div>
  );
};
