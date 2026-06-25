import React, { useMemo, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../../lib/AuthContext';
import { Button } from '../../../components/ui/button1/Button';
import { Loader } from '../../../components/ui/loader';
import { toast } from 'react-hot-toast';
import type { IUserAssignment } from '../../../modules/auth/types';

const ChooseWorkplacePage: React.FC = () => {
  const {
    user,
    isAuthenticated,
    activeBranchId,
    activeCounterId,
    setWorkplace,
    logout,
    isLoading: isAuthLoading,
  } = useAuth();
  const navigate = useNavigate();

  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [selectedCounterId, setSelectedCounterId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const isAdminUser = user?.isAdmin === true;
  const userAssignments = useMemo(() => user?.assignments ?? [], [user?.assignments]);

  const assignmentsByBranch = useMemo(() => {
    const grouped = new Map<string, IUserAssignment[]>();

    for (const assignment of userAssignments) {
      const list = grouped.get(assignment.branchId) ?? [];
      list.push(assignment);
      grouped.set(assignment.branchId, list);
    }

    return grouped;
  }, [userAssignments]);

  const visibleBranches = useMemo(() => {
    return Array.from(assignmentsByBranch.entries()).map(([branchId, branchAssignments]) => ({
      id: branchId,
      name: branchAssignments[0]?.branchName || 'Unknown Branch',
    }));
  }, [assignmentsByBranch]);

  const effectiveSelectedBranchId =
    selectedBranchId || visibleBranches[0]?.id || '';

  const selectedBranchAssignments =
    assignmentsByBranch.get(effectiveSelectedBranchId) ?? [];

  const visibleCounters = useMemo(() => {
    const seen = new Set<string>();

    return selectedBranchAssignments.filter(assignment => {
      if (seen.has(assignment.counterId)) {
        return false;
      }
      seen.add(assignment.counterId);
      return true;
    });
  }, [selectedBranchAssignments]);

  const effectiveSelectedCounterId =
    selectedCounterId || visibleCounters[0]?.id || '';

  if (isAuthLoading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && user.isAdmin) {
    return <Navigate to="/" replace />;
  }

  // If already chosen branch and counter, navigate to Dashboard
  if (activeBranchId && activeCounterId) {
    return <Navigate to="/" replace />;
  }

  if (
    !isAdminUser && userAssignments.length === 0
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveSelectedBranchId || !effectiveSelectedCounterId) {
      toast.error('Please select both branch and counter');
      return;
    }

    setIsSubmitting(true);
    try {
      setWorkplace(effectiveSelectedBranchId, effectiveSelectedCounterId);
      toast.success('Workplace set successfully!');
      navigate('/');
    } catch {
      toast.error('Failed to set workplace. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch {
      toast.error('Failed to logout');
    }
  };


  return (
    <div className="relative flex min-h-screen overflow-hidden bg-gradient-to-br from-primary-50 via-surface-primary to-primary-100">
      <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-primary-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-primary-300/30 blur-3xl" />

      {/* Left side - Image & Decorative content */}
      <div className="relative hidden overflow-hidden lg:block lg:w-1/2 xl:w-3/5">
        <div className="absolute inset-0 bg-gradient-to-br from-sidebar-primary via-primary-700 to-sidebar-secondary">
          <img
            src="/currency-exchange.jpg"
            alt="Currency Exchange"
            className="absolute inset-0 h-full w-full object-cover opacity-22 mix-blend-overlay"
          />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.22),_transparent_35%),linear-gradient(180deg,_rgba(15,23,42,0.08),_rgba(15,23,42,0.45))]" />
        <div className="relative flex h-full flex-col items-center justify-center px-12 text-text-inverse">
          <div className="mb-6 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-white/90 backdrop-blur-sm">
            Professional FX Dashboard
          </div>
          <h1 className="mb-6 text-center text-4xl font-bold tracking-tight xl:text-5xl">
            Workplace Selection
          </h1>
          <p className="max-w-md text-center text-lg leading-relaxed text-white/90 xl:text-xl">
            Please select your active branch and assigned transaction counter to
            access the currency exchange platform.
          </p>
        </div>
      </div>

      {/* Right side - Workplace Select Form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full">
          <div className="mx-auto mb-8 max-w-lg rounded-3xl bg-surface-primary/92 px-6 py-8 shadow-2xl shadow-primary-100/70 backdrop-blur-xl border border-border-primary">
            <div className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 shadow-lg shadow-primary-200/60">
                <svg
                  className="h-8 w-8 text-text-inverse"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-text-primary">
                Select Workplace
              </h2>
              <p className="mt-2 text-sm text-text-secondary">
                Choose a branch and counter to proceed
              </p>
            </div>

            <form onSubmit={handleConfirm} className="mt-8 space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-secondary">
                  Branch
                </label>
                <select
                  value={effectiveSelectedBranchId}
                  onChange={e => {
                    setSelectedBranchId(e.target.value);
                    setSelectedCounterId('');
                  }}
                  className="block w-full rounded-sm border border-border-secondary bg-surface-primary px-3 py-2.5 text-text-primary shadow-sm focus:border-primary-500 focus:ring-primary-500 focus-visible:outline-primary-500 focus-visible:ring-1 disabled:cursor-not-allowed disabled:bg-surface-secondary disabled:text-text-tertiary transition"
                  required
                >
                  <option value="" disabled>
                    Select Branch
                  </option>
                  {visibleBranches.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-secondary">
                  Counter
                </label>
                <select
                  value={effectiveSelectedCounterId}
                  onChange={e => setSelectedCounterId(e.target.value)}
                  disabled={!effectiveSelectedBranchId}
                  className="block w-full rounded-sm border border-border-secondary bg-surface-primary px-3 py-2.5 text-text-primary shadow-sm focus:border-primary-500 focus:ring-primary-500 focus-visible:outline-primary-500 focus-visible:ring-1 disabled:bg-surface-secondary disabled:text-text-tertiary disabled:cursor-not-allowed transition"
                  required
                >
                  <option value="" disabled>
                    {!effectiveSelectedBranchId
                      ? 'Select Branch first'
                      : 'Select Counter'}
                  </option>
                  {visibleCounters.map(c => (
                    <option key={c.counterId} value={c.counterId}>
                      {c.counterName}
                    </option>
                  ))}
                </select>
                {effectiveSelectedBranchId && visibleCounters.length === 0 && (
                  <p className="mt-1 text-xs text-error-600 animate-pulse">
                    No counters assigned to this branch.
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full mt-4"
                size="lg"
              disabled={
                  isSubmitting ||
                  !effectiveSelectedBranchId ||
                  !effectiveSelectedCounterId
                }
              >
                {isSubmitting ? 'Confirming...' : 'Confirm & Continue'}
              </Button>

              <div className="text-center pt-4 border-t border-border-muted">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-sm font-medium text-error-600 hover:text-error-700 hover:underline transition"
                >
                  Log Out / Switch Account
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChooseWorkplacePage;
