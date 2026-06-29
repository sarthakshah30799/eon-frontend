import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button1';
import { useDebounce } from '@/hooks';
import { useDeleteCompanyProfile, useListCompanyProfiles } from '../hooks';
import { CompanyProfileTable } from '../components';
import { Loader } from '@/components/ui/loader';

export const CompanyProfileListView = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const query = useMemo(
    () => ({
      search: debouncedSearch.trim() || undefined,
    }),
    [debouncedSearch]
  );
  const { data: companies = [], isLoading, isFetching, error } =
    useListCompanyProfiles(query);
  const { deleteCompany, isPending: isDeleting } = useDeleteCompanyProfile();

  const handleDelete = async (id: string) => {
    await deleteCompany(id);
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="py-6 text-center text-error-600">
        Unable to load company profiles.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          type="button"
          className="rounded-sm"
          onClick={() => navigate('/admin/company-profile/create')}
        >
          Create Company
        </Button>
      </div>

      <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
        <CompanyProfileTable
          companies={companies}
          onDelete={handleDelete}
          isDeleting={isDeleting}
          onSearch={value => setSearch(value)}
          searchValue={search}
          searchPlaceholder="Search company name, short code, PAN, CIN, or email"
          loading={isLoading || isFetching}
        />
      </section>
    </div>
  );
};
