import {
  UserRightsTable,
  UserRightsTreePreview,
} from '@/modules/userRole/components';
import type {
  UserRightsPermissionState,
  UserRightsRow,
  UserRightsRowState,
  UserRightsTreeNode,
} from '@/modules/userRole/types';
import { BRANCH_PROFILE_TEXTS } from '../constants';

interface BranchCounterRightsSectionProps {
  counterOptions: Array<{ value: string; label: string }>;
  activeCounterId: string | null;
  onSelectCounter: (counterId: string) => void;
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

const getCounterItemClassName = (isSelected: boolean) =>
  [
    'flex w-full cursor-pointer items-center justify-start border-0 bg-transparent px-0 py-1.5 text-left text-sm transition outline-none disabled:cursor-not-allowed',
    isSelected
      ? 'text-primary-700'
      : 'text-text-primary hover:text-primary-700',
  ].join(' ');

export const BranchCounterRightsSection = ({
  counterOptions,
  activeCounterId,
  onSelectCounter,
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
}: BranchCounterRightsSectionProps) => {
  if (counterOptions.length === 0) {
    return null;
  }

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
          {BRANCH_PROFILE_TEXTS.COUNTER_RIGHTS_TITLE}
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          {BRANCH_PROFILE_TEXTS.COUNTER_RIGHTS_SUBTITLE}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[220px_280px_minmax(0,1fr)]">
        <div className="max-h-[500px] overflow-y-scroll overflow-x-hidden bg-surface-primary p-3">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-text-tertiary">
            {BRANCH_PROFILE_TEXTS.COUNTER_RIGHTS_SIDEBAR_TITLE}
          </h3>
          <p className="mb-3 text-xs text-text-tertiary">
            {BRANCH_PROFILE_TEXTS.COUNTER_RIGHTS_SIDEBAR_HINT}
          </p>
          <ul className="space-y-1">
            {counterOptions.map(option => {
              const isSelected = option.value === activeCounterId;
              return (
                <li key={option.value}>
                  <button
                    type="button"
                    className={getCounterItemClassName(isSelected)}
                    disabled={isLoading}
                    onClick={() => {
                      onSelectCounter(option.value);
                    }}
                  >
                    <span className="truncate">{option.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="max-h-[500px] overflow-y-scroll overflow-x-hidden rounded-sm border border-border-primary bg-surface-primary p-4">
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
