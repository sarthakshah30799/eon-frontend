import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { Button, Table, type TableColumnDef } from '@/components/ui';
import { Accordion } from '@/components/ui/accordion';
import { CATEGORY_OPTION_CODE_LABELS } from '../constants';
import type { ICategoryOption } from '@/types/categoryOptionTypes';

interface MiscellaneousProfileTableProps {
  options: ICategoryOption[];
}

interface GroupedMiscellaneousProfiles {
  code: string;
  label: string;
  options: ICategoryOption[];
}

const statusClasses: Record<'active' | 'inactive', string> = {
  active: 'bg-success-50 text-success-600',
  inactive: 'bg-surface-secondary text-text-secondary',
};

const getCategoryLabel = (code: string) =>
  CATEGORY_OPTION_CODE_LABELS[code as keyof typeof CATEGORY_OPTION_CODE_LABELS] ?? code;

const buildGroupedOptions = (options: ICategoryOption[]): GroupedMiscellaneousProfiles[] => {
  const grouped = new Map<string, GroupedMiscellaneousProfiles>();

  options.forEach(option => {
    const current = grouped.get(option.code);

    if (current) {
      current.options.push(option);
      return;
    }

    grouped.set(option.code, {
      code: option.code,
      label: getCategoryLabel(option.code),
      options: [option],
    });
  });

  return Array.from(grouped.values());
};

export const MiscellaneousProfileTable = ({
  options,
}: MiscellaneousProfileTableProps) => {
  const navigate = useNavigate();
  const [openCategories, setOpenCategories] = useState<string[]>([]);

  const groupedOptions = useMemo(() => buildGroupedOptions(options), [options]);
  const optionColumns = useMemo<TableColumnDef<ICategoryOption>[]>(
    () => [
      {
        accessorKey: 'value',
        header: 'Value',
        cell: ({ row }) => (
          <span className="font-medium text-text-primary">
            {row.original.value}
          </span>
        ),
      },
      {
        accessorKey: 'label',
        header: 'Label',
        cell: ({ row }) => <span>{row.original.label}</span>,
      },
      {
        accessorKey: 'sortOrder',
        header: 'Sort Order',
        cell: ({ row }) => <span>{row.original.sortOrder}</span>,
      },
      {
        accessorKey: 'isActive',
        header: 'Status',
        cell: ({ row }) => (
          <span
            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
              row.original.isActive
                ? statusClasses.active
                : statusClasses.inactive
            }`}
          >
            {row.original.isActive ? 'Active' : 'Inactive'}
          </span>
        ),
      },
    ],
    []
  );

  if (!groupedOptions.length) {
    return (
      <div className="rounded-sm border border-dashed border-border-primary bg-surface-primary p-8 text-center text-sm text-text-secondary">
        No miscellaneous profiles found. Create your first profile.
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div className="hidden border-b border-border-primary bg-surface-secondary/60 px-2 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-text-tertiary lg:grid lg:grid-cols-[minmax(100px,1.2fr)_minmax(0,1.8fr)_120px_140px] lg:gap-4">
        <div>Category</div>
        <div>Options</div>
        <div>Count</div>
        <div className="text-right">Action</div>
      </div>

      <Accordion
        type="multiple"
        value={openCategories}
        onValueChange={value =>
          setOpenCategories(Array.isArray(value) ? value : value ? [value] : [])
        }
        className="rounded-none border-0 shadow-none"
      >
        {groupedOptions.map(group => {
          const previewOptions = group.options.slice(0, 3);
          const hiddenCount = Math.max(group.options.length - previewOptions.length, 0);
          const isOpen = openCategories.includes(group.code);

          return (
            <Accordion.Item key={group.code} value={group.code}>
              <div className="grid gap-4 lg:grid-cols-[minmax(100px,1.2fr)_minmax(0,1.8fr)_120px_140px] lg:items-center lg:gap-4 lg:px-5">
                <Accordion.Trigger className="w-full lg:col-span-3 lg:px-0">
                  <span className="grid w-full gap-4 text-left lg:grid-cols-[minmax(100px,1.2fr)_minmax(0,1.8fr)_120px] lg:items-center">
                    <span className="flex min-w-0 flex-col gap-1">
                      <span className="text-sm font-semibold text-text-primary">
                        {group.label}
                      </span>
                      {/* <span className="text-xs text-text-tertiary">{group.code}</span> */}
                    </span>

                    <span className="flex min-w-0 flex-wrap gap-2">
                      {previewOptions.map(option => (
                        <span
                          key={option.id}
                          className="inline-flex max-w-full items-center rounded-full border border-border-primary bg-surface-primary px-3 py-1 text-xs font-medium text-text-secondary"
                          title={option.label}
                        >
                          <span className="truncate">{option.label}</span>
                        </span>
                      ))}

                      {hiddenCount > 0 ? (
                        <span className="inline-flex items-center rounded-full bg-surface-secondary px-3 py-1 text-xs font-medium text-text-tertiary">
                          +{hiddenCount} more
                        </span>
                      ) : null}
                    </span>

                    <span className="flex flex-col text-sm text-text-secondary">
                      <span>
                        {group.options.length} option{group.options.length === 1 ? '' : 's'}
                      </span>
                      <span className="text-xs font-medium text-primary-600">
                        {isOpen ? 'Hide options' : 'Show options'}
                      </span>
                    </span>
                  </span>
                </Accordion.Trigger>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    aria-label={`Edit ${group.label}`}
                    className='border-0! bg-transparent! text-black!'
                    size="sm"
                    onClick={() =>
                      navigate(`/admin/miscellaneous-profile/edit/${encodeURIComponent(group.code)}`)
                    }
                  >
                    <PencilSquareIcon className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <Accordion.Content className="px-4 pb-5 sm:px-5">
                <div className="overflow-hidden rounded-sm border border-border-primary">
                  <Table
                    columns={optionColumns}
                    data={group.options}
                    enableSorting={false}
                    enableFiltering={false}
                    enablePagination={false}
                    className="min-w-full"
                  />
                </div>
              </Accordion.Content>
            </Accordion.Item>
          );
        })}
      </Accordion>
    </div>
  );
};
