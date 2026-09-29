import { useMemo, useState } from 'react';
import { EyeIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button1';
import { Loader } from '@/components/ui/loader';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Table, type TableColumnDef } from '@/components/ui/table/Table';
import {
  TABLE_ACTION_BUTTON_CLASSNAME,
  TABLE_ACTION_ICON_CLASSNAME,
  TABLE_ACTIONS_CELL_CLASSNAME,
} from '@/components/ui/table/tableActionStyles';
import { formatDateTime } from '@/utils';
import type { PendingApproval } from '@/api/dashboard/dashboard.api';
import {
  PENDING_APPROVALS_COLUMNS,
  PENDING_APPROVALS_EMPTY,
  PENDING_APPROVALS_ITEMS_LABEL,
  PENDING_APPROVALS_TITLE,
  PENDING_APPROVALS_VIEW_LABEL,
  PENDING_APPROVAL_ENTITY_TYPES,
  PENDING_APPROVAL_MODULE_LABELS,
  PENDING_STATUS_LABEL,
  type PendingApprovalEntityType,
} from '../constants/pendingApprovalModules';

interface PendingApprovalsProps {
  approvals: PendingApproval[];
  loading?: boolean;
  onItemClick: (item: PendingApproval) => void;
}

const isKnownEntityType = (
  entityType: string
): entityType is PendingApprovalEntityType =>
  (PENDING_APPROVAL_ENTITY_TYPES as readonly string[]).includes(entityType);

const PendingApprovals = ({
  approvals,
  loading = false,
  onItemClick,
}: PendingApprovalsProps) => {
  const grouped = useMemo(() => {
    const map = Object.fromEntries(
      PENDING_APPROVAL_ENTITY_TYPES.map(type => [type, [] as PendingApproval[]])
    ) as Record<PendingApprovalEntityType, PendingApproval[]>;

    for (const item of approvals) {
      if (isKnownEntityType(item.entityType)) {
        map[item.entityType].push(item);
      }
    }

    return map;
  }, [approvals]);

  const visibleTabs = useMemo(
    () =>
      PENDING_APPROVAL_ENTITY_TYPES.filter(type => grouped[type].length > 0),
    [grouped]
  );

  const defaultTab = useMemo(
    () => visibleTabs[0] ?? PENDING_APPROVAL_ENTITY_TYPES[0],
    [visibleTabs]
  );

  const [selectedTab, setSelectedTab] =
    useState<PendingApprovalEntityType | null>(null);

  const activeTab =
    selectedTab && visibleTabs.includes(selectedTab)
      ? selectedTab
      : defaultTab;

  const columns: TableColumnDef<PendingApproval>[] = useMemo(
    () => [
      {
        accessorKey: 'code',
        header: PENDING_APPROVALS_COLUMNS.code,
        cell: info => (
          <span className="font-mono text-primary">
            {(info.getValue() as string) || '\u2014'}
          </span>
        ),
      },
      {
        accessorKey: 'name',
        header: PENDING_APPROVALS_COLUMNS.name,
        cell: info => (info.getValue() as string) || '\u2014',
      },
      {
        id: 'type',
        header: PENDING_APPROVALS_COLUMNS.type,
        accessorFn: row =>
          row.subType
            ? `${PENDING_APPROVAL_MODULE_LABELS[row.entityType as PendingApprovalEntityType] ?? row.entityType} · ${row.subType}`
            : (PENDING_APPROVAL_MODULE_LABELS[
                row.entityType as PendingApprovalEntityType
              ] ?? row.entityType),
        cell: info => info.getValue() as string,
      },
      {
        id: 'status',
        header: PENDING_APPROVALS_COLUMNS.status,
        cell: () => (
          <span className="inline-flex items-center rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
            {PENDING_STATUS_LABEL}
          </span>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: PENDING_APPROVALS_COLUMNS.createdAt,
        cell: info => formatDateTime(info.getValue() as string),
      },
      {
        id: 'actions',
        header: PENDING_APPROVALS_COLUMNS.actions,
        cell: ({ row }) => (
          <div className={TABLE_ACTIONS_CELL_CLASSNAME}>
            <Button
              type="button"
              aria-label={PENDING_APPROVALS_VIEW_LABEL}
              variant="ghost"
              size="icon"
              className={TABLE_ACTION_BUTTON_CLASSNAME}
              onClick={event => {
                event.stopPropagation();
                onItemClick(row.original);
              }}
            >
              <EyeIcon className={TABLE_ACTION_ICON_CLASSNAME} />
            </Button>
          </div>
        ),
      },
    ],
    [onItemClick]
  );

  return (
    <section className="rounded-lg border border-border-primary bg-surface-primary shadow-sm">
      <div className="flex items-center justify-between border-b border-border-primary px-4 pb-3 pt-4">
        <h2 className="text-sm font-semibold text-text-primary">
          {PENDING_APPROVALS_TITLE}
        </h2>
        <span className="font-mono text-xs font-semibold text-amber-600">
          {approvals.length} {PENDING_APPROVALS_ITEMS_LABEL}
        </span>
      </div>

      {loading ? (
        <div className="px-4 py-6">
          <Loader variant="inline" size="sm" />
        </div>
      ) : visibleTabs.length === 0 ? (
        <div className="py-8 text-center text-xs text-text-tertiary">
          {PENDING_APPROVALS_EMPTY}
        </div>
      ) : (
        <Tabs
          value={activeTab}
          onValueChange={value =>
            setSelectedTab(value as PendingApprovalEntityType)
          }
          className="px-4 pb-4 pt-3"
        >
          <TabsList className="mb-3 flex w-full flex-nowrap gap-1 overflow-x-auto border-b border-border-primary bg-transparent p-0">
            {visibleTabs.map(type => {
              const count = grouped[type].length;
              return (
                <TabsTrigger
                  key={type}
                  value={type}
                  className="shrink-0 gap-1.5 whitespace-nowrap px-3 py-2 text-xs"
                >
                  <span>{PENDING_APPROVAL_MODULE_LABELS[type]}</span>
                  <span className="inline-flex min-w-[1.25rem] items-center justify-center rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                    {count}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {visibleTabs.map(type => (
            <TabsContent key={type} value={type}>
              <Table<PendingApproval>
                columns={columns}
                data={grouped[type]}
                enableSorting={false}
                enableFiltering={false}
                enablePagination={false}
                emptyMessage={PENDING_APPROVALS_EMPTY}
                className="text-xs"
              />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </section>
  );
};

export default PendingApprovals;
