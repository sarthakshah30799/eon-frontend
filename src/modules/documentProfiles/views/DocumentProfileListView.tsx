import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button1';
import { usePermission } from '@/hooks';
import { useDebounce } from '@/hooks';
import { DOCUMENT_PROFILE_TEXTS } from '../constants/documentProfileConstants';
import { DocumentProfileTable } from '../components';
import { useDeleteDocumentProfile, useListDocumentProfiles } from '../hooks';

export const DocumentProfileListView = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') ?? '';
  const debouncedSearch = useDebounce(search, 400);
  const { canAdd } = usePermission('/admin/document-profile');
  const query = useMemo(
    () => ({
      search: debouncedSearch.trim() || undefined,
    }),
    [debouncedSearch]
  );
  const { data: documentProfiles = [], isLoading, isFetching, error } =
    useListDocumentProfiles(query);
  const { deleteDocumentProfile, isPending: isDeleting } =
    useDeleteDocumentProfile();

  const handleDelete = async (id: string) => {
    await deleteDocumentProfile(id);
  };

  if (error) {
    return (
      <div className="py-6 text-center text-error-600">
        {DOCUMENT_PROFILE_TEXTS.LIST_ERROR}
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
            onClick={() => navigate('/admin/document-profile/create')}
          >
            Create Document Profile
          </Button>
        )}
      </div>

      <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
        <DocumentProfileTable
          documentProfiles={documentProfiles}
          onDelete={handleDelete}
          isDeleting={isDeleting}
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
          searchPlaceholder="Search code, specification type, type, entity type, or document type"
          loading={isLoading || isFetching}
        />
      </section>
    </div>
  );
};

export default DocumentProfileListView;
