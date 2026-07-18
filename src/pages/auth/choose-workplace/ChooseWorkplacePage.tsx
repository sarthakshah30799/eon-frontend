import React, { useMemo } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../../lib/AuthContext';
import { Loader } from '../../../components/ui/loader';
import { Form } from '../../../components/forms';
import { toast } from 'react-hot-toast';
import { useListBranchProfiles } from '@/modules/branchProfile/hooks';
import { useListCounterProfiles } from '@/modules/counterProfile/hooks';
import { WorkplaceFormFields } from './WorkplaceFormFields';
import type { IWorkplaceFormValues } from './chooseWorkplaceTypes';

const workplaceSchema = yup.object().shape({
  branchId: yup.string().required('Branch is required'),
  counterId: yup.string().required('Counter is required'),
});

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

  const canSelectAllBranches = Boolean(
    user?.isAdmin || user?.isHo || user?.isHoStaff
  );
  const userAssignments = useMemo(() => user?.assignments ?? [], [user?.assignments]);

  const { isLoading: isBranchesLoading } = useListBranchProfiles(
    { activeOnly: true },
    canSelectAllBranches
  );

  const { isLoading: isCountersLoading } = useListCounterProfiles(
    { activeOnly: true },
    canSelectAllBranches
  );

  const defaultValues = useMemo<IWorkplaceFormValues>(() => {
    if (canSelectAllBranches) {
      return {
        branchId: '',
        counterId: '',
      };
    }

    const firstAssignment = userAssignments[0];
    return {
      branchId: firstAssignment?.branchId ?? '',
      counterId: firstAssignment?.counterId ?? '',
    };
  }, [canSelectAllBranches, userAssignments]);

  if (isAuthLoading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (activeBranchId && activeCounterId) {
    return <Navigate to="/" replace />;
  }

  if (!canSelectAllBranches && userAssignments.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (canSelectAllBranches && (isBranchesLoading || isCountersLoading)) {
    return <Loader />;
  }

  const handleSubmit = async (values: IWorkplaceFormValues) => {
    try {
      await setWorkplace(values.branchId, values.counterId);
      toast.success('Workplace set successfully!');
      navigate('/');
    } catch {
      toast.error('Failed to set workplace. Please try again.');
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

      <div className="flex flex-1 flex-col justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full">
          <div className="mx-auto mb-8 max-w-lg rounded-3xl border border-border-primary bg-surface-primary/92 px-6 py-8 shadow-2xl shadow-primary-100/70 backdrop-blur-xl">
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

            <Form<IWorkplaceFormValues>
              id="choose-workplace-form"
              onSubmit={handleSubmit}
              resolver={yupResolver(workplaceSchema)}
              defaultValues={defaultValues}
              mode="all"
            >
              <div className="mt-8">
                <WorkplaceFormFields
                  canSelectAllBranches={canSelectAllBranches}
                  userAssignments={userAssignments}
                  onLogout={handleLogout}
                />
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChooseWorkplacePage;
