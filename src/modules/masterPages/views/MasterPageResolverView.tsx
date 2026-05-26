import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button1';
import { useMasterPages } from '@/lib';

export const MasterPageResolverView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { findPageBySlug } = useMasterPages();
  const page = findPageBySlug(location.pathname);

  if (!page) {
    return (
      <div className="rounded-3xl border border-border-primary bg-surface-primary p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-text-primary">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          This route has not been created yet in Master Pages.
        </p>
        <div className="mt-4">
          <Button
            type="button"
            onClick={() => navigate('/master/system-setups/master-pages')}
          >
            Go to Page Builder
          </Button>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-border-primary bg-surface-primary p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-tertiary">
          Generated Page
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-text-primary">
          {page.pageName}
        </h1>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          Slug:{' '}
          <span className="font-medium text-text-primary">{page.slug}</span>
        </p>
      </div>
    </section>
  );
};

export default MasterPageResolverView;
