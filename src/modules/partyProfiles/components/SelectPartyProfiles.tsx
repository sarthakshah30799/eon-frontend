import { useMemo, useState } from 'react';
import { Checkbox, SelectEntity, type TableColumnDef } from '@/components/ui';
import type { PaginationState } from '@tanstack/react-table';
import { useDebounce } from '@/hooks';
import { useListPartyProfiles } from '../hooks';
import { PartyProfileStatusEnum, type PartyProfileType } from '../types';
import type { IPartyProfile, IPartyProfileListQuery } from '../types';

interface SelectPartyProfilesProps {
  open: boolean;
  types: PartyProfileType | PartyProfileType[];
  selectable?: boolean;
  multiple?: boolean;
  title?: string;
  description?: string;
  queryParams?: Omit<IPartyProfileListQuery, 'page' | 'limit' | 'search'>;
  allowedProfileIds?: string[];
  initialSelectedProfiles?: IPartyProfile[];
  onContinue: (profiles: IPartyProfile[]) => void;
  onClose: () => void;
}

type SelectablePartyProfileRow = IPartyProfile & {
  rowKey: string;
};

const EMPTY_PARTY_PROFILE_ROWS: SelectablePartyProfileRow[] = [];

const buildSelectionColumns = (
  selectable: boolean,
  multiple: boolean
): TableColumnDef<SelectablePartyProfileRow>[] => {
  const columns: TableColumnDef<SelectablePartyProfileRow>[] = [
    {
      id: 'code',
      accessorKey: 'code',
      header: 'Code',
    },
    {
      id: 'name',
      accessorKey: 'name',
      header: 'Name',
    },
    {
      id: 'type',
      accessorKey: 'type',
      header: 'Type',
    },
    {
      id: 'city',
      accessorKey: 'city',
      header: 'City',
    },
    {
      id: 'phoneNo',
      accessorKey: 'phoneNo',
      header: 'Phone',
      cell: ({ row }) => row.original.phoneNo || '-',
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => (row.original.active ? 'Active' : 'Inactive'),
    },
  ];

  if (!selectable) {
    return columns;
  }

  return [
    {
      id: 'select',
      header: ({ table }) => (
        <div className="flex justify-center">
          <Checkbox
            checked={table.getIsAllRowsSelected()}
            onChange={checked => {
              table.toggleAllRowsSelected(checked);
            }}
            disabled={!multiple}
            aria-label="Select all party profiles"
            className="shrink-0"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onChange={checked => row.toggleSelected(checked)}
            aria-label={`Select ${row.original.code}`}
            className="shrink-0"
          />
        </div>
      ),
      enableSorting: false,
      meta: {
        headerClassName: 'w-14',
        cellClassName: 'w-14',
      },
    },
    ...columns,
  ];
};

export const SelectPartyProfiles = ({
  open,
  types,
  selectable = false,
  multiple = false,
  title = 'Select Party Profiles',
  description = 'Search and choose party profiles from the list.',
  queryParams,
  allowedProfileIds,
  initialSelectedProfiles = [],
  onContinue,
  onClose,
}: SelectPartyProfilesProps) => {
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(50);
  const [selectedProfiles, setSelectedProfiles] = useState<IPartyProfile[]>(
    initialSelectedProfiles
  );
  const debouncedSearch = useDebounce(search, 350);

  const normalizedTypes = useMemo(
    () => (Array.isArray(types) ? types : [types]),
    [types]
  );

  const {
    data: response,
    isLoading,
    isFetching,
  } = useListPartyProfiles(
    {
      search: debouncedSearch.trim() || undefined,
      page: 1,
      limit: pageSize,
      ...queryParams,
      activeOnly: true,
      status: PartyProfileStatusEnum.APPROVE,
    },
    normalizedTypes,
    open,
    true
  );

  const profiles = (response?.data ?? EMPTY_PARTY_PROFILE_ROWS).filter(
    profile =>
      allowedProfileIds === undefined || allowedProfileIds.includes(profile.id)
  );
  const selectedRowIds = selectedProfiles.map(profile => profile.id);
  const rows = useMemo<SelectablePartyProfileRow[]>(
    () =>
      profiles.map(profile => ({
        ...profile,
        rowKey: profile.id,
      })),
    [profiles]
  );

  const selectionColumns = useMemo(
    () => buildSelectionColumns(selectable, multiple),
    [multiple, selectable]
  );

  return (
    <>
      <SelectEntity<SelectablePartyProfileRow>
        open={open}
        title={title}
        description={description}
        columns={selectionColumns}
        data={rows}
        loading={isLoading || isFetching}
        selectable={selectable}
        multiple={multiple}
        searchValue={search}
        onSearch={value => {
          setSearch(value);
        }}
        searchPlaceholder="Search code, name, city, phone"
        emptyMessage="No party profiles found."
        onContinue={selectedRows =>
          (() => {
            const nextProfiles = selectedRows.map(row => {
              const { rowKey, ...profile } = row;
              void rowKey;
              return profile;
            });
            setSelectedProfiles(nextProfiles);
            onContinue(nextProfiles);
          })()
        }
        onClose={() => {
          setSelectedProfiles(initialSelectedProfiles);
          onClose();
        }}
        getRowId={row => row.rowKey}
        selectedRowIds={selectedRowIds}
        selectedRows={selectedProfiles.map(profile => ({
          ...profile,
          rowKey: profile.id,
        }))}
        onSelectedRowIdsChange={nextIds => {
          setSelectedProfiles(current => {
            const profilesById = new Map([
              ...current.map(profile => [profile.id, profile] as const),
              ...profiles.map(profile => [profile.id, profile] as const),
            ]);

            return nextIds
              .map(id => profilesById.get(id))
              .filter((profile): profile is IPartyProfile => Boolean(profile));
          });
        }}
        selectedSummary={
          selectedProfiles.length > 0 ? (
            <div className="rounded-sm border border-border-primary bg-surface-secondary p-3">
              <div className="mb-2 text-sm font-semibold text-text-primary">
                Selected Card Issuers ({selectedProfiles.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedProfiles.map(profile => {
                  const unavailable =
                    !profile.active ||
                    profile.status !== PartyProfileStatusEnum.APPROVE;
                  return (
                    <div
                      key={profile.id}
                      className="inline-flex items-center gap-2 rounded-full border border-border-secondary bg-surface-primary px-3 py-1 text-sm"
                    >
                      <span>
                        {profile.code} - {profile.name}
                      </span>
                      {unavailable && (
                        <span className="text-xs text-text-tertiary">
                          Unavailable
                        </span>
                      )}
                      <button
                        type="button"
                        className="text-error-600 hover:text-error-700"
                        aria-label={`Remove ${profile.code}`}
                        onClick={() => {
                          setSelectedProfiles(current =>
                            current.filter(item => item.id !== profile.id)
                          );
                        }}
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null
        }
        enablePagination
        pageSize={pageSize}
        onPaginationChange={(pagination: PaginationState) => {
          setPageSize(pagination.pageSize);
        }}
      />
    </>
  );
};

export default SelectPartyProfiles;
