import { useMemo, useState } from 'react';
import { Checkbox, SelectEntity, type TableColumnDef } from '@/components/ui';
import { useDebounce } from '@/hooks';
import { useListManualBillBooks } from '../hooks/useListManualBillBooks';
import type { IManualBook } from '@/api';

interface SelectManualBillBooksProps {
  open: boolean;
  branchId?: string;
  selectable?: boolean;
  multiple?: boolean;
  title?: string;
  description?: string;
  onContinue: (books: IManualBook[]) => void;
  onClose: () => void;
}

type SelectableManualBillBookRow = IManualBook & {
  rowKey: string;
};

const resolveAssignedToLabel = (assignedTo: IManualBook['assignedTo']) => {
  if (assignedTo && typeof assignedTo === 'object') {
    return assignedTo.name || assignedTo.id;
  }

  return assignedTo || '-';
};

const buildColumns = (
  selectable: boolean,
  multiple: boolean
): TableColumnDef<SelectableManualBillBookRow>[] => {
  const columns: TableColumnDef<SelectableManualBillBookRow>[] = [
    {
      id: 'no',
      accessorKey: 'no',
      header: 'Book No',
    },
    {
      id: 'dispatchDate',
      accessorKey: 'dispatchDate',
      header: 'Date',
    },
    {
      id: 'transactionType',
      accessorKey: 'transactionType',
      header: 'Txn Type',
    },
    {
      id: 'bookRange',
      header: 'Books From-To',
      cell: ({ row }) => `${row.original.bookNoFrom} - ${row.original.bookNoTo}`,
    },
    {
      id: 'branch',
      header: 'Branch',
      cell: ({ row }) => row.original.branchCode || '-',
    },
      {
        id: 'assignedTo',
        accessorKey: 'assignedTo',
        header: 'Assigned To',
        cell: ({ row }) => resolveAssignedToLabel(row.original.assignedTo),
      },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => row.original.status,
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
            aria-label="Select all manual bill books"
            className="shrink-0"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onChange={checked => row.toggleSelected(checked)}
            aria-label={`Select ${row.original.no}`}
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

export const SelectManualBillBooks = ({
  open,
  branchId,
  selectable = true,
  multiple = false,
  title = 'Select Manual Bill Book',
  description = 'Search and choose a manual bill book from the current branch.',
  onContinue,
  onClose,
}: SelectManualBillBooksProps) => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);
  const { data: books = [], isLoading, isFetching } =
    useListManualBillBooks({ branchId });

  const rows = useMemo<SelectableManualBillBookRow[]>(
    () =>
      books
        .filter(book => {
          const query = debouncedSearch.trim().toLowerCase();
          if (!query) {
            return true;
          }

          return [
            book.no,
            book.dispatchDate,
            book.transactionType,
            book.branchCode,
            book.branchName,
            resolveAssignedToLabel(book.assignedTo),
            book.status,
            String(book.bookNoFrom),
            String(book.bookNoTo),
          ]
            .filter(Boolean)
            .some(value => String(value).toLowerCase().includes(query));
        })
        .map(book => ({
          ...book,
          rowKey: book.id,
        })),
    [books, debouncedSearch]
  );

  const columns = useMemo(
    () => buildColumns(selectable, multiple),
    [multiple, selectable]
  );

  return (
    <SelectEntity<SelectableManualBillBookRow>
      open={open}
      title={title}
      description={description}
      columns={columns}
      data={rows}
      loading={isLoading || isFetching}
      selectable={selectable}
      multiple={multiple}
      searchValue={search}
      onSearch={value => setSearch(value)}
      searchPlaceholder="Search book no, branch, txn type, status"
      emptyMessage="No manual bill books found."
      onContinue={selectedRows =>
        onContinue(
          selectedRows.map(row => {
            const { rowKey, ...book } = row;
            void rowKey;
            return book;
          })
        )
      }
      onClose={onClose}
      getRowId={row => row.rowKey}
    />
  );
};

export default SelectManualBillBooks;
