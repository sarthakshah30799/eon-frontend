import React from 'react';

const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-border-primary bg-surface-primary shadow-sm">
        <div className="grid gap-6 bg-gradient-to-br from-primary-50 via-surface-primary to-primary-100 px-6 py-8 text-text-primary sm:px-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:px-10">
          <div className="space-y-4">
            <span className="inline-flex rounded-full border border-primary-200 bg-surface-primary px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-primary-700">
              Dashboard Overview
            </span>
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Welcome back, Admin
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-text-secondary sm:text-base">
                Use the sidebar to move through master data and transaction
                screens. This shell is now ready for the project&apos;s static
                navigation structure.
              </p>
            </div>
          </div>

          <div className="grid gap-3 rounded-3xl border border-border-primary bg-surface-primary p-4">
            {[
              ['Master', 'Profiles and setups'],
              ['Transactions', 'Receipt and stock flows'],
              ['Access', 'Admin profile controls'],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-border-primary bg-gradient-to-br from-surface-primary to-surface-secondary px-4 py-3"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-text-tertiary">
                  {label}
                </p>
                <p className="mt-1 text-sm font-medium text-text-primary">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            title: 'Currency Profiles',
            description: 'Maintain the supported currency records.',
          },
          {
            title: 'Company Profile',
            description: 'Keep organization details in one place.',
          },
          {
            title: 'Receipt',
            description: 'Record accounting transaction inflows.',
          },
          {
            title: 'Stock Transaction',
            description: 'Manage stock receipt and returns.',
          },
        ].map(card => (
          <article
            key={card.title}
            className="rounded-3xl bg-surface-primary p-5 shadow-sm"
          >
            <p className="text-sm font-semibold text-text-primary">
              {card.title}
            </p>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              {card.description}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
};

export default DashboardPage;
