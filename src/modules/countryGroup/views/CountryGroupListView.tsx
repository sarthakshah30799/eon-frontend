import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button1';
import { useDebounce, usePermission } from '@/hooks';
import { COUNTRY_GROUP_TEXTS } from '../constants';
import { CountryGroupTable } from '../components';
import { useDeleteCountryGroup, useListCountryGroups } from '../hooks';

export const CountryGroupListView = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { canAdd, canModify, canDelete } = usePermission(
    '/admin/country-group'
  );
  const search = searchParams.get('search') ?? '';
  const debouncedSearch = useDebounce(search, 400);
  const query = useMemo(
    () => debouncedSearch.trim().toLowerCase(),
    [debouncedSearch]
  );

  const {
    data: groups = [],
    isLoading,
    isFetching,
    error,
  } = useListCountryGroups();
  const { deleteCountryGroup, isPending: isDeleting } = useDeleteCountryGroup();

  const filteredGroups = useMemo(() => {
    if (!query) {
      return groups;
    }

    return groups.filter(group =>
      [group.code, group.name].some(value =>
        value.toLowerCase().includes(query)
      )
    );
  }, [groups, query]);

  const handleDelete = async (id: string) => {
    await deleteCountryGroup(id);
  };

  if (error) {
    return (
      <div className="py-6 text-center text-error-600">
        {COUNTRY_GROUP_TEXTS.LIST_ERROR}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        {canAdd && (
          <Button
            type="button"
            className="rounded-sm"
            onClick={() => navigate('/admin/country-group/create')}
          >
            {COUNTRY_GROUP_TEXTS.CREATE_BUTTON}
          </Button>
        )}
      </div>

      <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
        <CountryGroupTable
          groups={filteredGroups}
          canModify={canModify}
          canDelete={canDelete}
          isDeleting={isDeleting}
          onDelete={handleDelete}
          loading={isLoading || isFetching}
          onSearch={value =>
            setSearchParams(prev => {
              const nextParams = new URLSearchParams(prev);

              if (value.trim()) {
                nextParams.set('search', value.trim());
              } else {
                nextParams.delete('search');
              }

              return nextParams;
            })
          }
          searchValue={search}
          searchPlaceholder="Search country group code or name"
        />
      </section>
    </div>
  );
};

export default CountryGroupListView;
