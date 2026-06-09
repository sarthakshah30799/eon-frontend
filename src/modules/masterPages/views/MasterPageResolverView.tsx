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
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Page not found</h1>
        <p className="mt-2 text-sm text-slate-600">
          This route has not been created yet in Master Pages.
        </p>
        <div className="mt-4">
          <Button type="button" onClick={() => navigate('/admin/master-pages')}>
            Go to Page Builder
          </Button>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase text-slate-500">
          Generated Page
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">
          {page.pageName}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Slug: <span className="font-medium text-slate-900">{page.slug}</span>
        </p>
      </div>
    </section>
  );
};

export default MasterPageResolverView;
