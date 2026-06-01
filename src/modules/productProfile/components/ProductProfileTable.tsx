import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button1';
import { ToggleSwitch } from '@/components/ui/toggleSwitch';
import { Table, type TableColumnDef } from '@/components/ui/table';
import type { ProductProfileRecord } from '../types';

interface ProductProfileTableProps {
  products: ProductProfileRecord[];
  onToggleStatus: (id: string, isActiveProduct: boolean) => void | Promise<void>;
  isUpdatingStatus?: boolean;
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
            />
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      meta: {
        headerClassName:
          'sticky right-0 z-20 border-l border-border-primary bg-surface-secondary',
        cellClassName:
          'sticky right-0 z-10 border-l border-border-primary bg-surface-primary',
      },
      cell: ({ row }) => {
        const productId = row.original.id;

        return (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              aria-label="Edit product"
              variant="ghost"
              size="icon"
              className="rounded-sm bg-transparent text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
              onClick={event => {
                event.stopPropagation();
                navigate(`/master/system-setups/product-profile/edit/${productId}`);
              }}
            >
              <PencilSquareIcon className="h-5 w-5" />
            </Button>
          </div>
        );
      },
      enableSorting: false,
    },
  ];

  return (
    <Table
      columns={columns}
      data={rows}
      enableFiltering={false}
      enablePagination={false}
      enableRowSelection={false}
      enableColumnVisibility={false}
      onRowClick={row => {
        navigate(`/master/system-setups/product-profile/edit/${row.id}`);
      }}
      emptyMessage="No products found. Create your first product."
    />
  );
};
