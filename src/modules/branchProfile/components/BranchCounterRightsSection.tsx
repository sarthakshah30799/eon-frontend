import { AsyncSelect } from '@/components/ui';
import type { AsyncSelectOption } from '@/components/ui';
import { UserRoleRightsSection } from '@/modules/userRole/components';
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

  const selectedOption =
    counterOptions.find(option => option.value === activeCounterId) ?? null;

  return (
    <div className="space-y-4">
      <div className="max-w-md">
        <AsyncSelect
          label={BRANCH_PROFILE_TEXTS.COUNTER_RIGHTS_SELECTOR_LABEL}
          placeholder={BRANCH_PROFILE_TEXTS.COUNTER_RIGHTS_SELECTOR_PLACEHOLDER}
          defaultOptions={counterOptions}
          loadOptions={async inputValue => {
            const normalized = inputValue.trim().toLowerCase();
            return {
              options: normalized
                ? counterOptions.filter(option =>
                    option.label.toLowerCase().includes(normalized)
                  )
                : counterOptions,
            };
          }}
          value={selectedOption}
          onChange={option => {
            const selected = option as AsyncSelectOption | null;
            if (selected?.value != null) {
              onSelectCounter(String(selected.value));
            }
          }}
          isClearable={false}
          isDisabled={isLoading || counterOptions.length === 0}
        />
        <p className="mt-1 text-xs text-text-tertiary">
          {BRANCH_PROFILE_TEXTS.COUNTER_RIGHTS_SELECTOR_HINT}
        </p>
      </div>

      <UserRoleRightsSection
        title={BRANCH_PROFILE_TEXTS.COUNTER_RIGHTS_TITLE}
        subtitle={BRANCH_PROFILE_TEXTS.COUNTER_RIGHTS_SUBTITLE}
        rightsTreeNodes={rightsTreeNodes}
        selectedNodeId={selectedNodeId}
        selectedNodePathIds={selectedNodePathIds}
        selectedNodeLabel={selectedNodeLabel}
        visibleRows={visibleRows}
        rowStateById={rowStateById}
        onSelectNode={onSelectNode}
        onToggleAllRowsSelected={onToggleAllRowsSelected}
        onToggleRowSelected={onToggleRowSelected}
        onToggleColumnPermission={onToggleColumnPermission}
        onTogglePermission={onTogglePermission}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
};
