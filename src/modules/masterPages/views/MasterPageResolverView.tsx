import { useLocation } from 'react-router-dom';
import { AccessDeniedState } from '@/components/ui/access-denied-state';
import { NotFoundState } from '@/components/ui/not-found-state';
import { usePermission } from '@/hooks/usePermission';
import { useAuth } from '@/lib/AuthContext';
import { useMasterPages } from '@/lib';

export const MasterPageResolverView = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { findPageBySlug } = useMasterPages();
  const permission = usePermission(location.pathname);
  const page = findPageBySlug(location.pathname);
  const canSkipPermission = Boolean(
    user?.isAdmin || user?.isHo || user?.isHoStaff
  );

  if (!page) {
    return <NotFoundState />;
  }

  if (!permission.hasAnyPermission && !canSkipPermission) {
    return <AccessDeniedState />;
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
