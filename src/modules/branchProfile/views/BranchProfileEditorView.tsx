import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackButton } from '@/components/ui';
import { Button } from '@/components/ui/button1';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BranchProfileForm } from '../forms';
import { BranchCounterModal, BranchCounterTable } from '../components';
import {
  createEmptyBranchCounterFormValues,
  createEmptyBranchProfileFormValues,
  mapCounterFormValuesToRecord,
  mapCounterRecordToFormValues,
} from '../utils';
import type {
  BranchCounterFormValues,
  BranchCounterRecord,
  BranchProfileFormValues,
  BranchProfileOption,
} from '../types';

interface BranchProfileEditorViewProps {
  heading: string;
  description: string;
  submitLabel: string;
  defaultValues?: BranchProfileFormValues;
  initialCounters?: BranchCounterRecord[];
  onSubmitBranch: (
    values: BranchProfileFormValues,
    counters: BranchCounterRecord[]
  ) => void | Promise<void>;
  isSubmitting?: boolean;
  branchAttachedToOptions: BranchProfileOption[];
  showCounters?: boolean;
}

const createCounterId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `counter-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const now = (): string => new Date().toISOString();

export const BranchProfileEditorView = ({
  heading,
  description,
  submitLabel,
  defaultValues = createEmptyBranchProfileFormValues(),
  initialCounters = [],
  onSubmitBranch,
  isSubmitting = false,
  branchAttachedToOptions,
  showCounters = true,
}: BranchProfileEditorViewProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'branch' | 'counter'>('branch');
  const [counters, setCounters] = useState<BranchCounterRecord[]>(
    initialCounters
  );
  const [isCounterModalOpen, setCounterModalOpen] = useState(false);
  const [editingCounter, setEditingCounter] =
    useState<BranchCounterRecord | null>(null);

  const handleOpenCreateCounter = () => {
    setEditingCounter(null);
    setCounterModalOpen(true);
  };

  const handleOpenEditCounter = (counter: BranchCounterRecord) => {
    setEditingCounter(counter);
    setCounterModalOpen(true);
  };

  const handleDeleteCounter = (counterId: string) => {
    const shouldDelete = window.confirm(
      'Are you sure you want to delete this counter?'
    );

    if (!shouldDelete) {
      return;
    }

    setCounters(previousCounters =>
      previousCounters.filter(counter => counter.id !== counterId)
    );
  };

  const handleToggleCounterStatus = (counterId: string, isActive: boolean) => {
    setCounters(previousCounters =>
      previousCounters.map(counter =>
        counter.id === counterId ? { ...counter, isActive, updatedAt: now() } : counter
      )
    );

    setEditingCounter(previousCounter =>
      previousCounter && previousCounter.id === counterId
        ? { ...previousCounter, isActive, updatedAt: now() }
        : previousCounter
    );
  };

  const handleSaveCounter = async (values: BranchCounterFormValues) => {
    const timestamp = now();

    if (editingCounter) {
      const updatedCounter: BranchCounterRecord = {
        ...editingCounter,
        ...values,
        updatedAt: timestamp,
      };

      setCounters(previousCounters =>
        previousCounters.map(counter =>
          counter.id === editingCounter.id ? updatedCounter : counter
        )
      );
    } else {
      const newCounter = mapCounterFormValuesToRecord(
        values,
        createCounterId(),
        timestamp,
        timestamp
      );

      setCounters(previousCounters => [...previousCounters, newCounter]);
    }

    setCounterModalOpen(false);
    setEditingCounter(null);
  };

  const counterModalDefaultValues = useMemo(
    () =>
      editingCounter
        ? mapCounterRecordToFormValues(editingCounter)
        : createEmptyBranchCounterFormValues(),
    [editingCounter]
  );

  const handleSubmitBranch = async (values: BranchProfileFormValues) => {
    await onSubmitBranch(values, counters);
  };

  return (
    <section className="rounded-sm border border-border-primary bg-surface-primary p-6 shadow-sm">
      <div className="mb-6 space-y-4">
        <BackButton
          onClick={() =>
            navigate('/master/system-setups/branch-profile')
          }
          label="Back"
        />

        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-tertiary">
          System Setup
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-text-primary">
          {heading}
        </h1>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          {description}
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={value => setActiveTab(value as 'branch' | 'counter')}
      >
        <TabsList className="mb-5">
          <TabsTrigger value="branch">Branch</TabsTrigger>
          {showCounters && (
            <TabsTrigger value="counter">Counters</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="branch" className="border-0 p-0">
          <BranchProfileForm
            defaultValues={defaultValues}
            onSubmit={handleSubmitBranch}
            submitLabel={submitLabel}
            isSubmitting={isSubmitting}
            branchAttachedToOptions={branchAttachedToOptions}
          />
        </TabsContent>

        {showCounters && (
          <TabsContent value="counter" className="border-0 p-0">
            <div className="space-y-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-text-primary">
                    Counter
                  </h2>
                  <p className="mt-1 text-sm text-text-secondary">
                    Manage counters for this branch.
                  </p>
                </div>

                <Button
                  type="button"
                  className="rounded-sm"
                  onClick={handleOpenCreateCounter}
                >
                  Create Counter
                </Button>
              </div>

              <div className="rounded-sm border border-border-primary bg-surface-secondary p-4">
                <BranchCounterTable
                  counters={counters}
                  onEdit={handleOpenEditCounter}
                  onDelete={handleDeleteCounter}
                  onToggleStatus={handleToggleCounterStatus}
                  isUpdatingStatus={isSubmitting}
                />
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>

      {showCounters && (
        <BranchCounterModal
          key={editingCounter?.id ?? 'create-counter'}
          open={isCounterModalOpen}
          onOpenChange={open => {
            setCounterModalOpen(open);
            if (!open) {
              setEditingCounter(null);
            }
          }}
          title={editingCounter ? 'Edit Counter' : 'Create Counter'}
          description={
            editingCounter
              ? 'Update the selected counter details.'
              : 'Create a counter for this branch.'
          }
          submitLabel={editingCounter ? 'Save Changes' : 'Create Counter'}
          defaultValues={counterModalDefaultValues}
          onSubmit={handleSaveCounter}
          isSubmitting={isSubmitting}
        />
      )}
    </section>
  );
};
