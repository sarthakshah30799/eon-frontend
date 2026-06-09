import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button1';
import { useDeleteBranchProfile, useListBranchProfiles } from '../hooks';
import { BRANCH_PROFILE_TEXTS } from '../constants';
import { BranchProfileTable } from '../components';
import { Loader } from '@/components/ui/loader';

export const BranchProfileListView = () => {
  const navigate = useNavigate();
  const { data: branches = [], isLoading, error } = useListBranchProfiles();
  const { deleteBranchProfile, isPending: isDeleting } =
    useDeleteBranchProfile();

  const handleDelete = async (id: string) => {
    await deleteBranchProfile(id);
  };

  if (isLoading) {
    return <Loader />;
  }

  // if (error) {
  //   return (
  //     <div className="py-6 text-center text-error-600">
  //       {BRANCH_PROFILE_TEXTS.LIST_ERROR}
  //     </div>
  //   );
  // }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          type="button"
          className="rounded-sm"
          onClick={() => navigate('/admin/branch-profile/create')}
        >
          {BRANCH_PROFILE_TEXTS.CREATE_BRANCH}
        </Button>
      </div>

      <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
        <BranchProfileTable
          branches={branches}
          onDelete={handleDelete}
          isDeleting={isDeleting}
        />
      </section>
    </div>
  );
};
