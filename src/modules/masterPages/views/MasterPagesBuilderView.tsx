import { MasterPagesForm } from '../forms';

export const MasterPagesBuilderView = () => {
  return (
    <section className="space-y-6">
      <div className="rounded-sm border border-border-primary bg-surface-primary p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-tertiary">
          Master Pages
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-text-primary">
          Page Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          Create sidebar pages and nested children. Parent names come from the
          pages you already created, and the sidebar updates as soon as you
          confirm.
        </p>
      </div>

      <div className="rounded-sm border border-border-primary bg-surface-primary p-6 shadow-sm">
        <MasterPagesForm />
      </div>
    </section>
  );
};

export default MasterPagesBuilderView;
