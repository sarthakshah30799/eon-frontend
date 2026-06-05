import { MasterPagesForm } from '../forms';

export const MasterPagesBuilderView = () => {
  return (
    <section className="space-y-6">
      <div className="rounded-sm border border-border-primary bg-surface-primary p-6 shadow-sm">
        <MasterPagesForm />
      </div>
    </section>
  );
};

export default MasterPagesBuilderView;
