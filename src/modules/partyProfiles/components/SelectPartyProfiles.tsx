import { useMemo, useState } from 'react';
import { Checkbox, SelectEntity, type TableColumnDef } from '@/components/ui';
import { PaginationControls } from '@/components/ui/pagination';
import { useDebounce } from '@/hooks';
import { useListPartyProfiles } from '../hooks';
import type { PartyProfileType } from '../constants';
import type { IPartyProfile } from '../types';

interface SelectPartyProfilesProps {
  open: boolean;
  types: PartyProfileType | PartyProfileType[];
  selectable?: boolean;
  multiple?: boolean;
  title?: string;
  description?: string;
  filterProfiles?: (profile: IPartyProfile) => boolean;
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
  filterProfiles,
  onContinue,
  onClose,
}: SelectPartyProfilesProps) => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const debouncedSearch = useDebounce(search, 350);

  const normalizedTypes = useMemo(
    () => (Array.isArray(types) ? types : [types]),
    [types]
  );

  const { data: response, isLoading, isFetching } = useListPartyProfiles(
    {
      search: debouncedSearch.trim() || undefined,
      page,
      limit: pageSize,
    },
    normalizedTypes,
    open,
    true
  );

  const profiles = (response?.data ?? EMPTY_PARTY_PROFILE_ROWS).filter(profile =>
    filterProfiles ? filterProfiles(profile) : true
  );
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

  const totalItems = response?.totalItems ?? profiles.length;
  const totalPages = response?.totalPages ?? 0;

  return (
    <div>
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
          setPage(1);
          setSearch(value);
        }}
        searchPlaceholder="Search code, name, city, phone"
        emptyMessage="No party profiles found."
        onContinue={selectedRows =>
          onContinue(
            selectedRows.map(row => {
              const { rowKey, ...profile } = row;
              void rowKey;
              return profile;
            })
          )
        }
        onClose={() => {
          setPage(1);
          setPageSize(10);
          onClose();
        }}
        getRowId={row => row.rowKey}
        enablePagination={false}
      />

      <div className="mt-5">
        <PaginationControls
          page={page}
          pageSize={pageSize}
          totalItems={totalItems}
          totalPages={totalPages}
          onPageChange={nextPage => setPage(nextPage)}
          onPageSizeChange={nextPageSize => {
            setPage(1);
            setPageSize(nextPageSize);
          }}
          itemLabel="party profiles"
        />
      </div>
    </div>
  );
};

export default SelectPartyProfiles;
