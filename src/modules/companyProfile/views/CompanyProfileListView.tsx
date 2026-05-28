import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button1';
import { Table, type TableColumnDef } from '@/components/ui/table';
import { useListCompanyProfiles, useDeleteCompanyProfile } from '../hooks';
import type { CompanyProfile } from '../types';

export const CompanyProfileListView = () => {
  const navigate = useNavigate();
  const { data: companies = [], isLoading, error } = useListCompanyProfiles();
  const { deleteCompany, isPending: isDeleting } = useDeleteCompanyProfile();

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this company profile?');
    if (confirmDelete) {
      await deleteCompany(id);
    }
  };

  if (isLoading) {
    return (
      <div className="py-6 text-center text-text-secondary">
        Loading company profiles...
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6 text-center text-error-600">
        Failed to load company profiles.
      </div>
    );
  }

  const columns: TableColumnDef<CompanyProfile>[] = [
    { accessorKey: 'name', header: 'Company Name' },
    { accessorKey: 'rbiName', header: 'RBI Name' },
    { accessorKey: 'city', header: 'City' },
    { accessorKey: 'state', header: 'State' },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const companyId = row.original.id;
        return (
          <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate(`/master/system-setups/company-profile/edit/${companyId}`)}
            >
              Edit
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isDeleting}
              onClick={() => handleDelete(companyId)}
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
              Company Profiles
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
              Manage your company information, RBI designations, and primary contact addresses.
            </p>
          </div>

          <Button type="button" onClick={() => navigate('/master/system-setups/company-profile/create')}>
            Create Company
          </Button>
        </div>
      </section>

      <section className="rounded-2xl border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
        <Table
          columns={columns}
          data={companies}
          enableFiltering={false}
          enablePagination={false}
          enableRowSelection={false}
          enableColumnVisibility={false}
          onRowClick={(row) => {
            navigate(`/master/system-setups/company-profile/edit/${row.id}`);
          }}
          emptyMessage="No company profiles found. Create your first company profile."
        />
      </section>
    </div>
  );
};

export default CompanyProfileListView;
