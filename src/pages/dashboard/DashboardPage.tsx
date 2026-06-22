import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { usePendingPartyProfileReviews } from '@/modules/partyProfiles/hooks';
import { PartyProfileReviewQueue } from '@/modules/partyProfiles/components';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isReviewer = Boolean(user?.isAdmin || user?.isHo || user?.isHoStaff);
  const { data: pendingReviews = [], isLoading } = usePendingPartyProfileReviews();

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-sm border border-border-primary bg-surface-primary shadow-sm">
        <div className="grid gap-6 bg-gradient-to-br from-primary-50 via-surface-primary to-primary-100 px-6 py-8 text-text-primary sm:px-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:px-10">
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Welcome back{user?.name ? `, ${user.name}` : ''}
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-text-secondary sm:text-base">
                Review pending party profiles, manage master data, and keep the approval
                flow moving from one place.
              </p>
            </div>
          </div>

          <div className="grid gap-3 rounded-sm border border-border-primary bg-surface-primary p-4">
            {[
              ['Master', 'Profiles and setups'],
              ['Transactions', 'Receipt and stock flows'],
              ['Access', 'Admin profile controls'],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-sm border border-border-primary bg-gradient-to-br from-surface-primary to-surface-secondary px-4 py-3"
              >
                <p className="text-xs uppercase text-text-tertiary">{label}</p>
                <p className="mt-1 text-sm font-medium text-text-primary">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {isReviewer && (
        <PartyProfileReviewQueue
          profiles={pendingReviews}
          isLoading={isLoading}
          onReviewProfile={profile => {
            navigate(
              `/party-profiles/edit/${profile.id}?review=1${profile.type ? `&type=${profile.type}` : ''}`
            );
          }}
        />
      )}

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
            className="rounded-sm bg-surface-primary p-5 shadow-sm"
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
