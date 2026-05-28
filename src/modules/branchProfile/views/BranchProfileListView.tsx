import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button1';
import { Table, type TableColumnDef } from '@/components/ui/table';
import { useListBranchProfiles, useDeleteBranchProfile } from '../hooks';
import type { BranchProfile } from '../types';

export const BranchProfileListView = () => {
  const navigate = useNavigate();
  const { data: branches = [], isLoading, error } = useListBranchProfiles();
  const { deleteBranch, isPending: isDeleting } = useDeleteBranchProfile();

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this branch?');
    if (confirmDelete) {
      await deleteBranch(id);
    }
  };

  if (isLoading) {
    return (
      <div className="py-6 text-center text-text-secondary">
        Loading branches...
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6 text-center text-error-600">
        Failed to load branches.
      </div>
    );
  }

  const columns: TableColumnDef<BranchProfile>[] = [
    { accessorKey: 'branchCode', header: 'Branch Code' },
    { accessorKey: 'branchNumber', header: 'Branch No.' },
    { accessorKey: 'companyName', header: 'Company Name' },
    { accessorKey: 'city', header: 'City' },
    { accessorKey: 'phoneNumber1', header: 'Phone' },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const id = row.original.id;
        return (
          <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate(`/master/system-setups/branch-profile/edit/${id}`)}
            >
              Edit
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isDeleting}
              onClick={() => handleDelete(id)}
            >
              Delete
            </Button>
          </div>
        );
      },
      enableSorting: false,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border-primary bg-surface-primary p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-tertiary">
              Master / System setups
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-text-primary">
              Branch Profiles
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
              Manage company branches, locations, and primary contact phone numbers.
            </p>
          </div>

          <Button type="button" onClick={() => navigate('/master/system-setups/branch-profile/create')}>
            Create Branch
          </Button>
        </div>
      </section>

      <section className="rounded-2xl border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
        <Table
          columns={columns}
          data={branches}
          enableFiltering={false}
          enablePagination={false}
          enableRowSelection={false}
          enableColumnVisibility={false}
          onRowClick={(row) => {
            navigate(`/master/system-setups/branch-profile/edit/${row.id}`);
          }}
          emptyMessage="No branches found. Create your first branch profile."
        />
      </section>
    </div>
  );
};

export default BranchProfileListView;
