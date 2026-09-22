import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button1';
import { ToggleSwitch } from '@/components/ui/toggleSwitch';
import {
  Table,
  type TableColumnDef,
  TABLE_ACTIONS_CELL_CLASSNAME,
  TABLE_ACTION_BUTTON_CLASSNAME,
  TABLE_ACTION_ICON_CLASSNAME,
} from '@/components/ui/table';
import type { PaginationControlsProps } from '@/components/ui';
import type { IProductProfile } from '../types';

interface ProductProfileTableProps extends PaginationControlsProps {
  products: IProductProfile[];
  onToggleStatus: (
    id: string,
    isActiveProduct: boolean
  ) => void | Promise<void>;
  isUpdatingStatus?: boolean;
  loading?: boolean;
  isFetching?: boolean;
  onSearch?: (value: string) => void;
  searchValue?: string;
  searchPlaceholder?: string;
}

interface ProductProfileTableRow {
  id: string;
  productCode: string;
  productDescription: string;
  retail: string;
  bulkFee: string;
  isActiveProduct: boolean;
}

export const ProductProfileTable = ({
  products,
  onToggleStatus,
  isUpdatingStatus = false,
  loading = false,
  isFetching = false,
  onSearch,
  searchValue = '',
  searchPlaceholder = 'Search',
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: ProductProfileTableProps) => {
  const navigate = useNavigate();

  const rows: ProductProfileTableRow[] = useMemo(
    () =>
      products.map(product => ({
        id: product.id,
        productCode: product.productCode,
        productDescription: product.productDescription,
        retail: product.retail || '-',
        bulkFee: product.bulkFee || '-',
        isActiveProduct: product.isActiveProduct,
      })),
    [products]
  );

  const columns: TableColumnDef<ProductProfileTableRow>[] = [
    { accessorKey: 'productCode', header: 'Product Code' },
    { accessorKey: 'productDescription', header: 'Product Description' },
    { accessorKey: 'retail', header: 'Retail' },
    { accessorKey: 'bulkFee', header: 'Bulk Fee' },
    {
      accessorKey: 'isActiveProduct',
      header: 'Status',
      cell: ({ row }) => {
        const productId = row.original.id;
        const isActiveProduct = row.original.isActiveProduct;

        return (
          <div className="flex items-center gap-3">
            <ToggleSwitch
              checked={isActiveProduct}
              onCheckedChange={nextChecked => {
                onToggleStatus(productId, nextChecked);
              }}
              disabled={isUpdatingStatus}
              loading={isUpdatingStatus}
            />
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const productId = row.original.id;

        return (
          <div className={TABLE_ACTIONS_CELL_CLASSNAME}>
            <Button
              type="button"
              aria-label="Edit product"
              variant="ghost"
              size="icon"
              className={TABLE_ACTION_BUTTON_CLASSNAME}
              onClick={event => {
                event.stopPropagation();
                navigate(`/admin/product-profile/edit/${productId}`);
              }}
            >
              <PencilSquareIcon className={TABLE_ACTION_ICON_CLASSNAME} />
            </Button>
          </div>
        );
      },
      enableSorting: false,
    },
  ];

  return (
    <div className="space-y-4">
      <Table
        columns={columns}
        data={rows}
        enableFiltering={false}
        enablePagination
        manualPagination
        enableRowSelection={false}
        enableColumnVisibility={false}
        loading={loading}
        isFetching={isFetching}
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        onSearch={onSearch}
        searchValue={searchValue}
        searchPlaceholder={searchPlaceholder}
        onRowClick={row => {
          navigate(`/admin/product-profile/edit/${row.id}`);
        }}
        emptyMessage="No products found. Create your first product."
      />
    </div>
  );
};
