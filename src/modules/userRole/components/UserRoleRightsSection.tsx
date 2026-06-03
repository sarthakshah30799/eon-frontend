import { UserRightsTable } from './UserRightsTable';
import { UserRightsTreePreview } from './UserRightsTreePreview';
import type {
  UserRightsPermissionState,
  UserRightsRowState,
  UserRightsTreeNode,
  UserRightsRow,
} from '../types';

interface UserRoleRightsSectionProps {
  rightsTreeNodes: UserRightsTreeNode[];
  selectedNodeId: string | null;
  selectedNodePathIds: string[];
  selectedNodeLabel?: string;
  visibleRows: UserRightsRow[];
  rowStateById: Record<string, UserRightsRowState>;
  onSelectNode: (nodeId: string) => void;
  onToggleAllRowsSelected: (checked: boolean) => void;
  onToggleRowSelected: (rowId: string, checked: boolean) => void;
  onToggleColumnPermission: (
    permission: keyof UserRightsPermissionState,
    checked: boolean
  ) => void;
  onTogglePermission: (
    rowId: string,
    permission: keyof UserRightsPermissionState,
    checked: boolean
  ) => void;
  isLoading?: boolean;
  error?: Error | null;
}

export const UserRoleRightsSection = ({
  rightsTreeNodes,
  selectedNodeId,
  selectedNodePathIds,
  selectedNodeLabel,
  visibleRows,
  rowStateById,
  onSelectNode,
  onToggleAllRowsSelected,
  onToggleRowSelected,
  onToggleColumnPermission,
  onTogglePermission,
  isLoading = false,
  error = null,
}: UserRoleRightsSectionProps) => {
  if (error) {
    return (
      <div className="rounded-sm border border-error-500 bg-error-50 p-4 text-sm text-error-700">
        Unable to load rights options.
      </div>
    );
  }

  return (
    <section className="rounded-sm border border-border-primary bg-surface-secondary p-4 space-y-4">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-text-tertiary">
          User Rights
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          Control access to available options and manage permissions by action.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="rounded-sm border border-border-primary bg-surface-primary p-4">
          {isLoading ? (
            <p className="text-sm text-text-secondary">Loading options...</p>
          ) : (
            <UserRightsTreePreview
              nodes={rightsTreeNodes}
              selectedNodeId={selectedNodeId}
              selectedNodePathIds={selectedNodePathIds}
              onSelectNode={onSelectNode}
            />
          )}
        </div>

        <div className="overflow-hidden rounded-sm border border-border-primary bg-surface-primary p-4">
          <div className="mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-text-tertiary">
              Available Options
            </h3>
            <p className="mt-1 text-sm text-text-secondary">
              {selectedNodeLabel ?? 'Select a sidebar option'}
            </p>
          </div>

          <UserRightsTable
            rows={visibleRows}
            rowStateById={rowStateById}
            onToggleAllRowsSelected={onToggleAllRowsSelected}
            onToggleRowSelected={onToggleRowSelected}
            onToggleColumnPermission={onToggleColumnPermission}
            onTogglePermission={onTogglePermission}
          />
        </div>
      </div>
    </section>
  );
};
