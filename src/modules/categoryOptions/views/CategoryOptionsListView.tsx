import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button1';
import { Loader } from '@/components/ui/loader';
import { useListCategoryOptions } from '../hooks';
import { CATEGORY_OPTIONS_TEXTS } from '../constants';
import { CategoryOptionsTable } from '../components';

export const CategoryOptionsListView = () => {
  const navigate = useNavigate();
  const { data: options = [], isLoading, error } = useListCategoryOptions();

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="py-6 text-center text-error-600">
        Failed to load category options.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          type="button"
          className="rounded-sm"
          onClick={() => navigate('/admin/category-options/create')}
        >
          {CATEGORY_OPTIONS_TEXTS.CREATE_TITLE}
        </Button>
      </div>

      <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
        <CategoryOptionsTable options={options} />
      </section>
    </div>
  );
};

export default CategoryOptionsListView;
