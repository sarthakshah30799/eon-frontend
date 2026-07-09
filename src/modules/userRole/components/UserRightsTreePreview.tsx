import { useState } from 'react';
import { Button, Dropdown } from '@/components/ui';
import type { UserRightsTreeNode } from '../types';

interface UserRightsTreePreviewProps {
  nodes: UserRightsTreeNode[];
  selectedNodeId: string | null;
  selectedNodePathIds: string[];
  onSelectNode: (nodeId: string) => void;
}

interface TreeLevelProps {
  nodes: UserRightsTreeNode[];
  level?: number;
  selectedNodeId: string | null;
  selectedNodePathIds: string[];
  onSelectNode: (nodeId: string) => void;
}

const isSelectedNode = (selectedNodeId: string | null, nodeId: string) =>
  selectedNodeId === nodeId;

const isHighlightedNode = (
  selectedNodePathIds: string[],
  nodeId: string
): boolean => selectedNodePathIds.includes(nodeId);

const getTriggerClassName = (isHighlighted: boolean, level: number) =>
  [
    'flex w-full items-center justify-between gap-2 rounded-sm !border-0 !bg-transparent !shadow-none px-0! py-1 text-left text-sm transition',
    level === 0 ? 'font-semibold' : 'font-medium',
    isHighlighted
      ? '!text-primary-700'
      : '!text-text-primary hover:!text-primary-700',
  ].join(' ');

const getLeafItemClassName = (isSelected: boolean) =>
  [
    'w-full rounded-sm !border-0 px-0 py-1 text-left text-sm transition',
    isSelected
      ? '!text-primary-700'
      : '!text-text-primary hover:!text-primary-700',
  ].join(' ');

const TreeLevel = ({
  nodes,
  level = 0,
  selectedNodeId,
  selectedNodePathIds,
  onSelectNode,
}: TreeLevelProps) => {
  const [openItemId, setOpenItemId] = useState<string | null>(null);
  const [dismissDefaultOpen, setDismissDefaultOpen] = useState(false);
  const defaultOpenItemId = selectedNodePathIds[level] ?? null;
  const resolvedOpenItemId =
    openItemId ?? (dismissDefaultOpen ? null : defaultOpenItemId);

  return (
    <ul className={level === 0 ? 'space-y-2' : 'space-y-2 pl-4'}>
      {nodes.map(node => {
        const isSelected = isSelectedNode(selectedNodeId, node.id);
        const isHighlighted = isHighlightedNode(selectedNodePathIds, node.id);

        if (node.children.length > 0) {
          return (
            <li key={node.id}>
              <Dropdown
                className="w-full px-0!"
                align="start"
                closeOnOutsideClick={false}
                closeOnEscape={false}
                open={resolvedOpenItemId === node.id}
                onOpenChange={nextOpen => {
                  if (nextOpen) {
                    setDismissDefaultOpen(false);
                    setOpenItemId(node.id);
                    return;
                  }

                  setOpenItemId(null);
                  if (node.id === defaultOpenItemId) {
                    setDismissDefaultOpen(true);
                  }
                }}
              >
                <Dropdown.Trigger
                  className={getTriggerClassName(isHighlighted, level)}
                >
                  <span className="truncate">{node.label}</span>
                </Dropdown.Trigger>

                <Dropdown.Menu
                  className="mt-1 w-full !static !z-auto !min-w-0 !overflow-visible !rounded-none !border-0 !bg-transparent !p-0 !shadow-none !ring-0"
                  placement="bottom"
                  offset={8}
                >
                  <TreeLevel
                    nodes={node.children}
                    level={level + 1}
                    selectedNodeId={selectedNodeId}
                    selectedNodePathIds={selectedNodePathIds}
                    onSelectNode={onSelectNode}
                  />
                </Dropdown.Menu>
              </Dropdown>
            </li>
          );
        }

        return (
          <li key={node.id}>
            <Button
              type="button"
              className={getLeafItemClassName(isSelected)}
              onClick={() => {
                onSelectNode(node.id);
              }}
            >
              <span className="truncate">{node.label}</span>
            </Button>
          </li>
        );
      })}
    </ul>
  );
};

export const UserRightsTreePreview = ({
  nodes,
  selectedNodeId,
  selectedNodePathIds,
  onSelectNode,
}: UserRightsTreePreviewProps) => {
  return (
    <div className="pr-2">
      <TreeLevel
        key={selectedNodeId ?? 'default-rights-tree'}
        nodes={nodes}
        selectedNodeId={selectedNodeId}
        selectedNodePathIds={selectedNodePathIds}
        onSelectNode={onSelectNode}
      />
    </div>
  );
};
